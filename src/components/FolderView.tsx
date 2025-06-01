import type { FolderViewProps } from '@/types/viewerTypes';

export function FolderView({
  folder,
  isSelected = false,
  onClick,
  onDoubleClick,
  thumbnailSize = 120,
  showImageCount = true,
  className = '',
}: FolderViewProps) {
  const handleClick = () => {
    onClick(folder);
  };

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(folder);
    }
  };

  return (
    <div
      className={`
        flex flex-col items-center p-3 cursor-pointer rounded-lg transition-colors
        hover:bg-gray-100 ${isSelected ? 'bg-blue-50 border-2 border-blue-300' : 'border-2 border-transparent'}
        ${className}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div
        className="flex items-center justify-center bg-gray-200 rounded-md overflow-hidden mb-2"
        style={{ width: thumbnailSize, height: thumbnailSize }}
      >
        {folder.thumbnailImage ? (
          <img
            src={folder.thumbnailImage.path || '/placeholder.svg'}
            alt={`${folder.name}のサムネイル`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div
          className={`flex items-center justify-center w-full h-full text-gray-400 ${folder.thumbnailImage ? 'hidden' : ''}`}
        >
          <span className="text-4xl">📁</span>
        </div>
      </div>

      <div className="text-center w-full">
        <p className="text-sm text-gray-700 break-words leading-tight">
          {folder.name}
        </p>
        {showImageCount && folder.imageCount !== undefined && (
          <p className="text-xs text-gray-500 mt-1">{folder.imageCount}枚</p>
        )}
      </div>
    </div>
  );
}
