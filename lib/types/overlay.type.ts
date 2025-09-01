import { OverlayContent } from "../enums";

export type OverlayConfig =
  | { type: OverlayContent.VIEW_PROFILE; userId: string }
  | { type: OverlayContent.NONE };
