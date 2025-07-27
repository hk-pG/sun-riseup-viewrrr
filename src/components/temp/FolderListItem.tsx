import { useThumbnail } from '../../features/folder-navigation';

type Props = {
  folderPath: string;
  name: string;
  isSelected: boolean;
  onClick: (folderPath: string) => void;
};

export function FolderListItem({
  folderPath,
  name,
  isSelected,
  onClick,
}: Props) {
  const { thumbnail } = useThumbnail(folderPath);

  return (
    <button
      type="button"
      onClick={() => onClick(folderPath)}
      className={`p-2 cursor-pointer ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
    >
      {thumbnail ? (
        <img src={thumbnail.assetUrl} alt="thumbnail" />
      ) : (
        <div className="w-20 h-20 bg-gray-200 animate-pulse rounded mb-1" />
      )}
      <div className="text-sm text-gray-700 truncate">{name}</div>
    </button>
  );
}
