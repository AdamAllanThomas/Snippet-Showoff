// Importing necessary constants and types
import { AssignmentStatus } from "../../lib/constants";
import { Claim } from "../../lib/types";

// Defines the action types for claims
export const ClaimActionType = {
  SET_CLAIMS: "SET_CLAIMS", // Action type for setting claims
  CHANGE_ACTIVE_TAB: "CHANGE_ACTIVE_TAB", // Action type for changing the active tab
  CLEAR_CLAIMS: "CLEAR_CLAIMS", // Action type for clearing claims
} as const;

// Defines the structure of claims
export type Claims = {
  [AssignmentStatus.UnAssigned]: ClaimsState; // Claims and pagination state for the corresponding status
  [AssignmentStatus.InProgress]: ClaimsState; // Claims and pagination state for the corresponding status
  [AssignmentStatus.Completed]: ClaimsState; // Claims and pagination state for the corresponding status
};

// Defines the structure of claims state
export type ClaimsState = {
  claims: Claim[]; // Array of claims for the corresponding status
  page: number; // Current page number for pagination
  active: boolean; // Flag indicating if the tab is active
  total: number; // Total number of claims on the server for the status, used for pagination.
};

// Defines the payload structure for claim actions
type ActionPayload = { key: AssignmentStatus; claims: Claim[]; total: number };

// Defines the possible actions for the claims table
export type ClaimAction =
  | { type: typeof ClaimActionType.SET_CLAIMS; payload: ActionPayload } // Action to set claims
  | {
      type: typeof ClaimActionType.CHANGE_ACTIVE_TAB;
      payload: AssignmentStatus;
    } // Action to change the active tab
  | { type: typeof ClaimActionType.CLEAR_CLAIMS } // Action to clear claims

// Function to create the initial state for claims
function createInitialClaimState(): ClaimsState {
  return {
    claims: [],
    page: 1,
    active: false,
    total: 0,
  };
}

// Initial state for claims
const initialState: Claims = {
  [AssignmentStatus.UnAssigned]: createInitialClaimState(),
  [AssignmentStatus.InProgress]: createInitialClaimState(),
  [AssignmentStatus.Completed]: createInitialClaimState(),
};

// Function to get the active tab from the claims state
function getActiveTab(state: Claims): AssignmentStatus {
  return Object.entries(state).find(
    ([_, claimState]) => claimState.active
  )?.[0] as AssignmentStatus;
}

// Function to update the claims state
function updateClaims(
  state: Claims,
  key: AssignmentStatus,
  claims: Claim[],
  total: number
): Claims {
  return {
    ...state,
    [key]: {
      ...state[key],
      claims: [...state[key].claims, ...claims],
      total,
      page: state[key].page + 1,
    },
  };
}

// Reducer function for claims
export function claimsReducer(state: Claims, action: ClaimAction): Claims {
  switch (action.type) {
    case ClaimActionType.SET_CLAIMS: {
      return updateClaims(
        state,
        action.payload.key,
        action.payload.claims,
        action.payload.total
      );
    }
    case ClaimActionType.CHANGE_ACTIVE_TAB: {
      const currentActiveTab = getActiveTab(state);
      return {
        ...state,
        [currentActiveTab]: {
          ...state[currentActiveTab],
          active: false,
        },
        [action.payload]: {
          ...state[action.payload],
          active: true,
        },
      };
    }
    case ClaimActionType.CLEAR_CLAIMS:
      return { ...initialState };
    default:
      throw new Error("Unsupported action type.");
  }
}
