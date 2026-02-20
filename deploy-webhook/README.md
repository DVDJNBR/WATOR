# Installation du Webhook de Déploiement

Cette solution permet de déployer automatiquement depuis GitHub vers le VPS à chaque push sur `main`.
Le projet est déjà déployé sur le VPS, il suffit de configurer le webhook pour les mises à jour automatiques.

## Prérequis

Le projet doit être cloné sur le VPS :
```bash
ssh utilisateur@wator.dvdjnbr.fr
cd /home/utilisateur  # ou votre répertoire préféré
git clone https://github.com/DVDJNBR/WATOR.git wator
cd wator
```

## Installation sur le VPS

### 1. Configurer le webhook

```bash
ssh utilisateur@wator.dvdjnbr.fr
cd /home/utilisateur/wator  # ou le chemin de votre projet
```

### 2. Rendre les scripts exécutables

```bash
chmod +x deploy-webhook/deploy.sh
chmod +x deploy-webhook/webhook-server.py
```

### 3. Générer un token de déploiement sécurisé

```bash
# Générer un token aléatoire
TOKEN=$(openssl rand -hex 32)
echo "Votre token de déploiement: $TOKEN"
# Sauvegardez ce token, vous en aurez besoin pour GitHub
```

### 4. Configurer le service systemd

Modifiez le fichier service avec votre token :

```bash
sudo nano /etc/systemd/system/wator-webhook.service
# Copiez le contenu de wator-webhook.service
# Remplacez YOUR_SECRET_TOKEN_HERE par le token généré
# Ajustez les chemins si nécessaire
```

### 5. Démarrer le service

```bash
sudo systemctl daemon-reload
sudo systemctl enable wator-webhook
sudo systemctl start wator-webhook
sudo systemctl status wator-webhook
```

### 6. Configurer Nginx comme reverse proxy

Ajoutez à votre configuration nginx (`/etc/nginx/sites-available/wator`) :

```nginx
server {
    listen 443 ssl http2;
    server_name wator.dvdjnbr.fr;

    # Vos certificats SSL existants...

    # Route pour le webhook (ne pas exposer publiquement si possible)
    location /deploy {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Optionnel : restreindre l'accès aux IPs de GitHub
        # allow 140.82.112.0/20;
        # allow 143.55.64.0/20;
        # allow 185.199.108.0/22;
        # allow 192.30.252.0/22;
        # deny all;
    }

    # Votre config existante pour l'app...
    location / {
        proxy_pass http://localhost:3000;  # ou votre port
    }
}
```

Redémarrez Nginx :
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Configuration GitHub

1. Allez sur **GitHub** → **Votre repo** → **Settings** → **Secrets and variables** → **Actions**
2. Créez un secret : **`DEPLOY_TOKEN`** avec le token généré précédemment

## Test

Faites un push sur `main` :

```bash
git add .
git commit -m "Test automatic deployment"
git push origin main
```

Vérifiez :
- L'onglet **Actions** sur GitHub
- Les logs sur le VPS : `sudo journalctl -u wator-webhook -f`
- Les logs de déploiement : `tail -f /var/log/wator-deploy.log`

## Maintenance

```bash
# Voir les logs du webhook
sudo journalctl -u wator-webhook -f

# Redémarrer le webhook
sudo systemctl restart wator-webhook

# Voir les logs de déploiement
tail -f /var/log/wator-deploy.log

# Tester manuellement le webhook
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Deploy-Token: VOTRE_TOKEN" \
  https://wator.dvdjnbr.fr/deploy
```

## Personnalisation

- **Chemin du projet** : Modifiez `PROJECT_PATH` dans `wator-webhook.service`
- **Port du webhook** : Modifiez `WEBHOOK_PORT` (par défaut 9000)
- **Script de déploiement** : Personnalisez `deploy.sh` selon vos besoins
