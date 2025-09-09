export type ActivePlugins = "tips" | "tokens" | "bullmeter";

export type SocialMedias = "youtube" | "twitch" | "x";

export type SocialMediaUrls = {
  [key in SocialMedias]: string;
};
