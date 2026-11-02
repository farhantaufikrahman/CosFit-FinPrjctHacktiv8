// GET INTERFACE

export interface GetUser {
  _id: string;
  email: string;
  password: string;
  username: string;
  role?: string;
  token?: number;
  UserImg?: string;
  claimedAt?: string;
}

export interface GetProduct {
  _id: string;
  imgUrl: string;
  title: string;
  imgGalery?: string[];
  desc: string;
  size: string;
  theme: string[];
  originalPrice: number;
  stock: number;
  vendorId: string;
  views: number;
  discount: number;
  finalPrice: number;
  wishlists: [GetWishlist];
  slug: string;
}

export interface GetWishlist {
  _id: string;
  productId: string;
  userId: string;
  product: GetProduct;
  vendor: GetVendor;
}

export interface GetUserProfile {
  _id: string;
  userId: [GetUser];
  address: string;
  photo: string;
}

export interface GetCheckout {
  _id: string;
  productId: string;
  userId: string;
  status: string;
  quantity?: number;
  product: GetProduct;
  vendor: GetVendor;
}

export interface GetInputImage {
  yourImg: File;
  cosImg: File;
}

export interface GetChat {
  _id: string;
  content: string;
  userId: string;
  roomId: string;
  imgUrl: string;
}

export interface GetRoom {
  _id: string;
  nameForum: string;
  desc: string;
  img: string;
  tag: [string];
}

export interface GetOrder {
  _id: string;
  orderId: string;
  items: { productId: string; price: number; quantity: number; name: string }[];
  total: number;
  paymentStatus: string;
  userId: string;
  product: GetProduct[];
  vendor: GetVendor[];
}

export interface GetOurEvent {
  _id: string;
  slug: string;
  eventName: string;
  category: string;
  imgUrl: string;
  creatorId?: string;
  forumId?: string;
  description: string;
  startDate?: string;
  endDate?: string;
  locationName?: string;
  address?: string;
  externalLink?: string;
  eventType?: EventType;
  entries?: EventEntry[];
  maxEntries?: number;
  status?: "upcoming" | "active" | "ended";
  createdAt?: string;
  updatedAt?: string;
}

export interface GetUserDesign {
  _id: string;
  imgUrl: string;
  userId: string;
  vote: number;
  entryTitle?: string;
  username?: string;
}

export interface GetVendor {
  _id: string;
  namaToko: string;
  alamat: string;
  email: string;
  password: string;
  norek: string;
}

export interface GetMonthlySales {
  totalSales: number;
  vendorId: string;
}

// INI POST INTERFACE

export interface PostUser {
  email: string;
  password: string;
  username: string;
}

export interface PostProduct {
  imgUrl: string;
  imgGalery?: string[];
  desc: string;
  size: string;
  theme: string[];
  title: string;
  originalPrice: string;
  discount?: string;
  finalPrice?: string;
  stock: number;
}

export interface PostWishlist {
  productId: string;
}

export interface PostUserProfile {
  userId: string;
  address: string;
  photo: string;
}

export interface PostCheckout {
  productId: string;
  status: string;
}

export interface PostInputImage {
  yourImg: File;
  cosImg: File;
}

export interface PostChat {
  content: string;
  userId: string;
  roomId: string;
  imgUrl: string;
}

export interface PostRoom {
  nameForum: string;
  desc: string;
  tag: string[];
}

export type EventType = "external_convention" | "internal_contest";

export interface EventEntry {
  _id?: string;
  userId: string;
  entryTitle: string;
  entryImage?: string;
  voteCount: number;
}

export interface GetEvent {
  _id: string;
  title: string;
  description: string;
  category?: string;
  forumId?: string;
  coverImage?: string;
  startDate: string;
  endDate?: string;
  locationName?: string;
  address?: string;
  externalLink?: string;
  eventType: EventType;
  entries?: EventEntry[];
  maxEntries?: number;
  status?: "upcoming" | "active" | "ended";
  createdAt?: string;
  updatedAt?: string;
}

export interface PostEvent {
  title: string;
  description: string;
  category?: string;
  imgUrl?: string;
  creatorId?: string;
  forumId?: string;
  coverImage?: string;
  startDate: string;
  endDate?: string;
  locationName?: string;
  address?: string;
  externalLink?: string;
  eventType: EventType;
  entries?: EventEntry[];
  status?: "upcoming" | "active" | "ended";
}

export interface PostOurEvent {
  eventName: string;
  slug?: string;
  category: string;
  imgUrl: string;
  creatorId?: string;
  forumId?: string;
  description: string;
  startDate?: string;
  endDate?: string;
  locationName?: string;
  address?: string;
  externalLink?: string;
  eventType?: EventType;
  entries?: EventEntry[];
  maxEntries?: number;
  status?: "upcoming" | "active" | "ended";
  updatedAt?: string;
}

export interface PostUserDesign {
  imgUrl: string;
  vote: number;
  eventId: string;
  entryTitle: string;
}
export interface PostVendor {
  namaToko: string;
  alamat: string;
  email: string;
  password: string;
  no_rek?: string[];
  no_phone: string;
  webUrl?: string;
}

export interface PostMonthlySales {
  totalSales: number;
  vendorId: string;
}

export type GetSavedLook = {
  _id: string;
  UserId: string;
  UserImg: string;
  AiImgUrl: string;
  Name: string;
  Theme: string;
  createdAt: string;
};
export interface ProductType {
  _id: string;
  imgUrl: string;
  title: string;
  desc: string;
  size: string;
  theme: string;
  originalPrice: number;
  stock: number;
  vendorId: string;
  views: number;
  discount: number;
  finalPrice: number;
  slug: string;
}

export interface HistoryType {
  _id: string;
  UserId: string;
  AiImgUrl: string;
  Name: string;
  Theme: string;
  UserImg: string;
  createdAt: Date;
}

export interface StatTokenType {
  token: number;
  claimedAt: string | Date | null;
}
