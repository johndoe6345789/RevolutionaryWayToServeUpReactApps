import React from "react";

import componentPatterns from "@/lib/component-patterns.json";

interface ConsoleIconProps {
  text: string;
}

export function ConsoleIcon({ text }: ConsoleIconProps): React.JSX.Element {
  const svgLines = componentPatterns.svg.consoleIcon;
  const svgContent = svgLines.join("\n").replace("{text}", text);

  return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
}
