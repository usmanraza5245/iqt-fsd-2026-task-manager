export type Task = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Quote = {
  text: string;
  author: string;
};
