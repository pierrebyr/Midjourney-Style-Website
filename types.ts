
export interface MidjourneyParams {
  sref?: string;
  model?: string;
  seed?: number;
  ar?: string;
  chaos?: number;
  stylize?: number;
  weird?: number;
  tile?: boolean;
  version?: number | string;
  raw?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Password is optional on the type for security reasons (not sending it to frontend)
  avatar: string;
  bio: string;
  followers: string[]; // array of user ids
  following: string[]; // array of user ids
}

export interface Comment {
    id: string;
    styleId: string;
    authorId: string;
    text: string;
    createdAt: string;
}

export interface Style {
  id: string;
  slug: string;
  title: string;
  sref: string;
  images: string[];
  mainImageIndex: number;
  params: MidjourneyParams;
  description?: string;
  tags: string[];
  views: number;
  likes: number;
  likedBy: string[]; // array of user ids
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  styleIds: string[];
  userId: string; // Owner of the collection
  createdAt: string;
}