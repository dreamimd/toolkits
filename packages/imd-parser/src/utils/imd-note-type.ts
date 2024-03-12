import type { RmpNote } from '../types'

/** 是否为单点 */
export function isTap(note: RmpNote) {
  return note.toTrack === 0
}

/** 是否为长按动作，包括单长按和持续动作中的长按 */
export function isHold(note: RmpNote) {
  return note.dur > 0
}

/** 是否为滑动，包括单滑和持续动作中的滑动 */
export function isSlide(note: RmpNote) {
  return !isHold(note) && !isTap(note)
}

/** 是否为单点、单滑、单长按 */
export function isSingleAction(note: RmpNote) {
  return (!isTap(note) && note.isEnd === 1 && note.attr === 3) || isTap(note)
}

/** 是否为持续动作中的开始 */
export function isLineStart(note: RmpNote) {
  return note.isEnd === 0 && note.attr === 3
}

/** 是否为持续动作中的进行时 */
export function isLineProcess(note: RmpNote) {
  return note.isEnd === 0 && note.attr === 4
}

/** 是否为持续动作的结束 */
export function isLineEnd(note: RmpNote) {
  return note.isEnd === 1 && note.attr === 4
}
