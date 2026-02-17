import React from 'react';

const Grid = ({ grid }) => {
  if (!grid) return <div>Loading...</div>;

  return (
    <div className="flex flex-col border border-blue-300 bg-blue-500 shadow-xl rounded-lg overflow-hidden select-none">
      {grid.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div
                key={`${x}-${y}`}
                className={`w-4 h-4 flex items-center justify-center text-[10px]
                    ${cell === 'water' ? 'bg-blue-500' : 'bg-blue-400'}`}
                title={`(${x},${y}) ${cell}`}
            >
              {cell === 'fish' && '🐠'}
              {cell === 'shark' && '🦈'}
              {cell === 'water' && ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
