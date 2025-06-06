import type { FolderInfo, ImageFile } from "../types"

// モック画像データ
export const createMockImages = (folderName: string, count: number): ImageFile[] => {
  return Array.from({ length: count }, (_, index) => ({
    path: `/placeholder.svg?height=800&width=600&text=${folderName}-${index + 1}`,
    name: `${folderName}_page_${String(index + 1).padStart(3, "0")}.jpg`,
    size: Math.floor(Math.random() * 2000000) + 500000, // 0.5MB - 2.5MB
    lastModified: new Date(Date.now() - Math.random() * 86400000 * 30), // 過去30日以内
  }))
}

// モックフォルダデータ
export const mockFolders: FolderInfo[] = [
  {
    path: "/manga/one-piece-vol-1",
    name: "ワンピース 第1巻",
    thumbnailImage: {
      path: "/placeholder.svg?height=400&width=300&text=ワンピース1巻",
      name: "cover.jpg",
    },
    imageCount: 192,
  },
  {
    path: "/manga/naruto-vol-1",
    name: "NARUTO -ナルト- 第1巻",
    thumbnailImage: {
      path: "/placeholder.svg?height=400&width=300&text=ナルト1巻",
      name: "cover.jpg",
    },
    imageCount: 184,
  },
  {
    path: "/manga/attack-on-titan-vol-1",
    name: "進撃の巨人 第1巻",
    thumbnailImage: {
      path: "/placeholder.svg?height=400&width=300&text=進撃の巨人1巻",
      name: "cover.jpg",
    },
    imageCount: 196,
  },
  {
    path: "/manga/demon-slayer-vol-1",
    name: "鬼滅の刃 第1巻",
    thumbnailImage: {
      path: "/placeholder.svg?height=400&width=300&text=鬼滅の刃1巻",
      name: "cover.jpg",
    },
    imageCount: 208,
  },
  {
    path: "/manga/my-hero-academia-vol-1",
    name: "僕のヒーローアカデミア 第1巻",
    thumbnailImage: {
      path: "/placeholder.svg?height=400&width=300&text=ヒロアカ1巻",
      name: "cover.jpg",
    },
    imageCount: 200,
  },
  {
    path: "/manga/jujutsu-kaisen-vol-1",
    name: "呪術廻戦 第1巻",
    thumbnailImage: {
      path: "/placeholder.svg?height=400&width=300&text=呪術廻戦1巻",
      name: "cover.jpg",
    },
    imageCount: 192,
  },
  {
    path: "/manga/chainsaw-man-vol-1",
    name: "チェンソーマン 第1巻",
    thumbnailImage: {
      path: "/placeholder.svg?height=400&width=300&text=チェンソーマン1巻",
      name: "cover.jpg",
    },
    imageCount: 200,
  },
  {
    path: "/manga/spy-family-vol-1",
    name: "SPY×FAMILY 第1巻",
    thumbnailImage: {
      path: "/placeholder.svg?height=400&width=300&text=スパイファミリー1巻",
      name: "cover.jpg",
    },
    imageCount: 188,
  },
]

// フォルダごとの画像データマップ
export const mockImagesByFolder: Record<string, ImageFile[]> = {
  "/manga/one-piece-vol-1": createMockImages("ワンピース1巻", 192),
  "/manga/naruto-vol-1": createMockImages("ナルト1巻", 184),
  "/manga/attack-on-titan-vol-1": createMockImages("進撃の巨人1巻", 196),
  "/manga/demon-slayer-vol-1": createMockImages("鬼滅の刃1巻", 208),
  "/manga/my-hero-academia-vol-1": createMockImages("ヒロアカ1巻", 200),
  "/manga/jujutsu-kaisen-vol-1": createMockImages("呪術廻戦1巻", 192),
  "/manga/chainsaw-man-vol-1": createMockImages("チェンソーマン1巻", 200),
  "/manga/spy-family-vol-1": createMockImages("スパイファミリー1巻", 188),
}
