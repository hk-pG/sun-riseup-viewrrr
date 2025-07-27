/**
 * 画像の表示用リソース情報を表す型。
 * - idはファイルパスやUUIDなどの一意な識別子。
 * - nameは表示用のファイル名。
 * - assetUrlはTauriのconvertFileSrcなどで変換した画像URL。
 * - ImageFile（ファイル情報型）から変換して利用されることが多い。
 * - ImageContainerやLocalFolderContainerで返却される。
 */
export type ImageSource = {
  /**
   * 識別子(ファイルパスやUUIDなど)
   */
  id: string;

  /**
   * 表示用ファイル名
   */
  name: string;

  /**
   * 表示に使うconvertFileSrcで変換したURL
   */
  assetUrl: string;
};
