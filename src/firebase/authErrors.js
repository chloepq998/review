const MESSAGES = {
  'auth/email-already-in-use': '이미 가입된 학번입니다.',
  'auth/invalid-email': '학번 형식이 올바르지 않습니다.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
  'auth/invalid-credential': '학번 또는 비밀번호가 올바르지 않습니다.',
  'auth/user-not-found': '학번 또는 비밀번호가 올바르지 않습니다.',
  'auth/wrong-password': '학번 또는 비밀번호가 올바르지 않습니다.',
  'auth/too-many-requests': '잠시 후 다시 시도해주세요.',
}

export function toAuthErrorMessage(error) {
  return MESSAGES[error?.code] ?? '문제가 발생했습니다. 다시 시도해주세요.'
}
