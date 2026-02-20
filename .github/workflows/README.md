# Configuration du déploiement automatique

Ce workflow déploie automatiquement l'application WATOR sur le VPS OVH à chaque push sur la branche `main` via un **webhook**.

## Comment ça fonctionne

1. Un commit est poussé sur `main` (par vous, Jules, ou n'importe qui)
2. GitHub Actions envoie un webhook au VPS
3. Le VPS pull automatiquement les changements et redémarre l'application

**Votre machine locale n'est jamais impliquée dans le déploiement.**

## Avantages de cette approche

- Déploiement direct GitHub → VPS, sans machine intermédiaire
- Pas de gestion de clés SSH : Jules ou vous pouvez push depuis n'importe où
- Simple et sécurisé : authentification par token unique
- Léger : GitHub Actions déclenche juste un webhook, le VPS fait le reste

## Configuration rapide

### Sur le VPS

Suivez les instructions détaillées dans [deploy-webhook/README.md](../deploy-webhook/README.md) :

1. Installer le serveur webhook
2. Générer un token de sécurité
3. Configurer le service systemd
4. Configurer Nginx pour exposer `/deploy`

### Sur GitHub

1. Allez sur **GitHub** → **Votre Repository** → **Settings** → **Secrets and variables** → **Actions**
2. Créez un secret **`DEPLOY_TOKEN`** avec le token généré sur le VPS

### Testez

```bash
git add .
git commit -m "Test automatic deployment"
git push origin main
```

Suivez l'exécution dans l'onglet **Actions** de votre repository GitHub.

## Dépannage

Si le déploiement ne fonctionne pas :

```bash
# Sur le VPS, vérifier les logs du webhook
sudo journalctl -u wator-webhook -f

# Vérifier les logs de déploiement
tail -f /var/log/wator-deploy.log

# Tester manuellement le webhook
curl -X POST \
  -H "X-Deploy-Token: VOTRE_TOKEN" \
  https://wator.dvdjnbr.fr/deploy
```
