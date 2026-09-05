import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Comment } from '@/types';
import { MOCK_COMMENTS } from '@/lib/mockData';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/utils/persistence';
import { generateId } from '@/utils/id';
import { nowISO } from '@/utils/date';

interface CommentState {
  comments: Comment[];
}

function loadInitialState(): CommentState {
  return {
    comments: getFromStorage(STORAGE_KEYS.COMMENTS, MOCK_COMMENTS),
  };
}

const persist = (state: CommentState) => {
  setToStorage(STORAGE_KEYS.COMMENTS, state.comments);
};

const commentSlice = createSlice({
  name: 'comment',
  initialState: loadInitialState(),
  reducers: {
    addComment(state, action: PayloadAction<{
      taskId: string;
      authorId: string;
      content: string;
      mentions: string[];
    }>) {
      const comment: Comment = {
        id: generateId('comment'),
        taskId: action.payload.taskId,
        authorId: action.payload.authorId,
        content: action.payload.content,
        mentions: action.payload.mentions,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      state.comments.push(comment);
      persist(state);
    },

    editComment(state, action: PayloadAction<{ id: string; content: string; mentions: string[] }>) {
      const comment = state.comments.find(c => c.id === action.payload.id);
      if (comment) {
        comment.content = action.payload.content;
        comment.mentions = action.payload.mentions;
        comment.editedAt = nowISO();
        comment.updatedAt = nowISO();
        persist(state);
      }
    },

    deleteComment(state, action: PayloadAction<string>) {
      state.comments = state.comments.filter(c => c.id !== action.payload);
      persist(state);
    },

    resetComments(state) {
      state.comments = [...MOCK_COMMENTS];
      persist(state);
    },

    loadComments(state, action: PayloadAction<Comment[]>) {
      state.comments = action.payload;
      persist(state);
    },
  },
});

export const { addComment, editComment, deleteComment, resetComments, loadComments } = commentSlice.actions;
export default commentSlice.reducer;
