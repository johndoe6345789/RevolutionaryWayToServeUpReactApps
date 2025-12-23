import { getStringService } from "../bootstrap/services/string-service";

export const FEATURED_GAMES = () => {
  const strings = getStringService();
  return strings.getGameData('featured');
};

export const SYSTEM_TAGS = () => {
  const strings = getStringService();
  return strings.getGameData('systemTags');  
};

export const CTA_BUTTON_STYLE = {
  px: 3,
  py: 1.5,
  borderRadius: 999,
  fontSize: 12,
};
