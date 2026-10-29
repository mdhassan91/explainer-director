// Hand-written scenes for beats that no template covers. Key = beat id. Everything else comes from templates (beats.json "template").
import React from "react";
import type { Ctx } from "../lib/film";
import { P, Pop, Tape, Stamp, Counter, Person, Icon, ease, ramp } from "../lib/flat";
import { Svg, Abs, cap, glowTxt, at, Floor, Duo } from "../lib/backdrops";
export const SCENES: Record<string, (c: Ctx) => React.ReactNode> = {
};
export const DRAMA = new Set<string>([]); // extra letterbox beats (dialogue-template beats are added automatically)
