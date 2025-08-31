import { PageContent } from "./enums";

export type PageContentHistory = {
  pageContent: PageContent;
  queryParams: Record<string, string>;
};
