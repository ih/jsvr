// @ts-check
import { sleep } from '../async-lib.js';

let root = null;
export const LEFT_HAND = 'leftHand';
export const RIGHT_HAND = 'rightHand';
export const LEFT = 'left';
export const RIGHT = 'right';
export const UP = 'up';
export const DOWN = 'down';
export const BACK = 'back';
export const FORWARD = 'forward';
export const MENU = 'menu';
export const TRIGGER = 'trigger';
export const GRIP = 'grip';
export const ABUTTON = 'abutton';

let handMode = false;

let leftHandMap = {};
leftHandMap[LEFT] = 'a';
leftHandMap[RIGHT] = 'd';
leftHandMap[MENU] = 'r';

let rightHandMap = {};
rightHandMap[LEFT] = 'j';
rightHandMap[RIGHT] = 'l';
rightHandMap[UP] = 'i';
rightHandMap[DOWN] = 'k';
rightHandMap[BACK] = 'o';
rightHandMap[FORWARD] = 'u';
rightHandMap[TRIGGER] = 'h';
rightHandMap[GRIP] = 'p';
rightHandMap[ABUTTON] = ';';


let handKeyMappings = {}
handKeyMappings[LEFT_HAND] = leftHandMap;
handKeyMappings[RIGHT_HAND] = rightHandMap;

export function initialize(initialRoot) {
  root = initialRoot;
}

export async function dispatchKeyDown(key, repetitions = 1, delay = 100) {
  let keyEvent = new KeyboardEvent('keydown', {key: key});
  for (let i = 0; i < repetitions; i++) {
    await sleep(delay);
    root.dispatchEvent(keyEvent);
  }
}

export function toggleHandMode() {
  dispatchKeyDown('Shift');
  handMode = !handMode;
}

export async function handAction(hand, action, amount = 1, delay = 100) {
  if (!handMode) {
    toggleHandMode();
  }
  let key = handKeyMappings[hand][action];
  await dispatchKeyDown(key, amount, delay);
}

