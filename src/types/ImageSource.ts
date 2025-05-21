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
