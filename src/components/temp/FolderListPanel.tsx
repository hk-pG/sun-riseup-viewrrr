import type { FolderEntry } from '../hooks/useSiblingFolders';
import { FolderListItem } from './FolderListItem';

type Props = {
  entries: FolderEntry[];
  currentFolder: string;
  onSelect: (folderPath: string) => void;
};

export default function FolderListPanel({
  entries,
  currentFolder,
  onSelect,
}: Props) {
  return (
    <div className="w-40 overflow-y-auto border-r border-gray-300 p-2 space-y-2">
      {entries.map((entry) => (
        <FolderListItem
          key={entry.path}
          folderPath={entry.path}
          name={entry.name}
          isSelected={entry.path === currentFolder}
          onClick={() => {
            onSelect(entry.path);
          }}
        />
      ))}
    </div>
  );
}
