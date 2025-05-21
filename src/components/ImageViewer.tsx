import { useState } from 'react';
import useSWR from 'swr';
import { LocalFolderContainer } from '../containers/LocalFolderContainer';
import { useServices } from '../context/ServiceContext';

type Props = {
  folderPath: string;
};

export default function ImageViewer({ folderPath }: Props) {
  // 現在表示している画像のインデックス
  const [current, setCurrent] = useState(0);
  const fs = useServices();

  // 画像を取得する関数
  async function fetchImages(path: string) {
    const container = new LocalFolderContainer(path, fs);
    return await container.listImages();
  }

  // SWRを使って画像を取得
  const {
    data: images,
    isLoading,
    error,
  } = useSWR(folderPath, fetchImages, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  // 現在表示している画像のインデックスを変更する関数
  const changeCurrent = (index: number) => {
    if (images && images.length > 0) {
      if (index < 0) {
        setCurrent(images.length - 1);
      } else if (index >= images.length) {
        setCurrent(0);
      } else {
        setCurrent(index);
      }
    }
  };

  return (
    <>
      {!!images && images.length > 0 && (
        <div>
          {/* 現在表示している画像 */}
          <img
            alt="selected file in folder"
            src={`${images[current].assetUrl}`}
            className="max-h-full max-w-full object-contain"
          />
          {/* 画像のインデックスを表示 */}
          <div>
            <p>
              {current + 1} / {images.length}
            </p>
          </div>
          <div className="flex justify-center w-full absolute bottom-0">
            <button onClick={() => changeCurrent(current - 1)} type="button">
              {/* 左矢印 */}
              <span>&lt;</span>
            </button>

            <button onClick={() => changeCurrent(current + 1)} type="button">
              {/* 右矢印 */}
              <span>&gt;</span>
            </button>
          </div>
        </div>
      )}
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {!images && !isLoading && !error && (
        <p>No images found in this folder.</p>
      )}
    </>
  );
}
