import { configureStore } from '@reduxjs/toolkit';
import matchReducer from './slices/matchSlice';
import teamReducer from './slices/teamSlice';
import scoringReducer from './slices/scoringSlice';
import clubReducer from './slices/clubSlice';

export const store = configureStore({
  reducer: {
    match: matchReducer,
    team: teamReducer,
    scoring: scoringReducer,
    club: clubReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});