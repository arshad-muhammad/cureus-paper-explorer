
export interface Author {
  name: string;
  email?: string | null;
}

export interface Paper {
  title: string;
  doi: string;
  authors: Author[];
  publicationYear: number | string;
  url: string;
}
