import { customAlphabet } from 'nanoid'

export function generateRoomId(): string {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)
  return `ROOM-${nanoid()}`
}

// Usage when creating an appointment:
// const roomID = generateRoomId() // e.g., "ROOM-A1B2C3D4E5F6"