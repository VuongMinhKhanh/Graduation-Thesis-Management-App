export const MyUserReducer = (current, action) => {
    switch (action.type) {
        case "login":
        case "SET_USER":
            return action.payload;
        case "logout":
            return null;
    }

    return current;
}

export const MyUnreadMessagesReducer = (current, action) => {
  switch (action.type) {
    case 'SET_UNREAD_MESSAGES':
      return action.payload;
  }

  return current;
};

