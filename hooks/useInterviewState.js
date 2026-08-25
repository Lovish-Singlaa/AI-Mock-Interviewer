import { useState, useCallback, useRef } from 'react';

export const InterviewState = {
    IDLE: "idle",
    PREPARING: "preparing",
    SPEAKING: "speaking",
    LISTENING: "listening",
    PAUSED: "paused",
    EVALUATING: "evaluating",
    TRANSITIONING: "transitioning",
    COMPLETED: "completed",
    ERROR: "error"
};

export const InterviewEvent = {
    START_INTERVIEW: "START_INTERVIEW",
    QUESTION_READY: "QUESTION_READY",
    TTS_STARTED: "TTS_STARTED",
    TTS_FINISHED: "TTS_FINISHED",
    TTS_ERROR: "TTS_ERROR",
    STT_STARTED: "STT_STARTED",
    STT_RESULT: "STT_RESULT",
    STT_STOPPED: "STT_STOPPED",
    STT_ERROR: "STT_ERROR",
    PAUSE: "PAUSE",
    RESUME: "RESUME",
    STOP_ANSWER: "STOP_ANSWER",
    EVALUATION_SUCCESS: "EVALUATION_SUCCESS",
    EVALUATION_ERROR: "EVALUATION_ERROR",
    ACK_FINISHED: "ACK_FINISHED",
    NEXT_QUESTION: "NEXT_QUESTION",
    INTERVIEW_COMPLETE: "INTERVIEW_COMPLETE",
    ENABLE_CONVERSATIONAL_MODE: "ENABLE_CONVERSATIONAL_MODE",
    DISABLE_CONVERSATIONAL_MODE: "DISABLE_CONVERSATIONAL_MODE"
};

/**
 * Pure function to handle state transitions
 */
export function transition(currentState, event) {
    switch (currentState) {
        case InterviewState.IDLE:
            if (event === InterviewEvent.START_INTERVIEW) return InterviewState.PREPARING;
            if (event === InterviewEvent.STT_STARTED) return InterviewState.LISTENING;
            if (event === InterviewEvent.TTS_STARTED) return InterviewState.SPEAKING;
            break;
            
        case InterviewState.PREPARING:
            if (event === InterviewEvent.TTS_STARTED) return InterviewState.SPEAKING;
            if (event === InterviewEvent.STT_STARTED) return InterviewState.LISTENING;
            if (event === InterviewEvent.QUESTION_READY) return InterviewState.IDLE;
            break;

        case InterviewState.SPEAKING:
            if (event === InterviewEvent.TTS_FINISHED) return InterviewState.IDLE;
            if (event === InterviewEvent.TTS_ERROR) return InterviewState.ERROR;
            break;

        case InterviewState.LISTENING:
            if (event === InterviewEvent.PAUSE) return InterviewState.PAUSED;
            if (event === InterviewEvent.STOP_ANSWER) return InterviewState.EVALUATING;
            if (event === InterviewEvent.STT_STOPPED) return InterviewState.IDLE;
            if (event === InterviewEvent.STT_ERROR) return InterviewState.ERROR;
            break;

        case InterviewState.PAUSED:
            if (event === InterviewEvent.RESUME) return InterviewState.LISTENING;
            if (event === InterviewEvent.STOP_ANSWER) return InterviewState.EVALUATING;
            if (event === InterviewEvent.STT_STOPPED) return InterviewState.IDLE;
            break;

        case InterviewState.EVALUATING:
            if (event === InterviewEvent.EVALUATION_SUCCESS) return InterviewState.TRANSITIONING;
            if (event === InterviewEvent.INTERVIEW_COMPLETE) return InterviewState.COMPLETED;
            if (event === InterviewEvent.EVALUATION_ERROR) return InterviewState.IDLE; // Allow retry
            break;

        case InterviewState.TRANSITIONING:
            if (event === InterviewEvent.NEXT_QUESTION) return InterviewState.PREPARING; 
            if (event === InterviewEvent.INTERVIEW_COMPLETE) return InterviewState.COMPLETED;
            break;
            
        case InterviewState.COMPLETED:
            // Terminal state
            break;

        case InterviewState.ERROR:
            // Can recover from error
            if (event === InterviewEvent.START_INTERVIEW) return InterviewState.PREPARING;
            if (event === InterviewEvent.STT_STARTED) return InterviewState.LISTENING;
            if (event === InterviewEvent.TTS_STARTED) return InterviewState.SPEAKING;
            break;
    }
    
    // Ignore invalid transitions or events that don't change state (e.g. STT_RESULT)
    return currentState;
}

export function useInterviewState() {
    const [state, setState] = useState(InterviewState.IDLE);
    const stateRef = useRef(state);

    const dispatch = useCallback((event) => {
        setState(prev => {
            const next = transition(prev, event);
            if (prev !== next) {
                console.log(`[Interview State] ${prev} + ${event} -> ${next}`);
            }
            stateRef.current = next;
            return next;
        });
    }, []);

    // Helper to get current state safely inside async callbacks
    const getState = useCallback(() => stateRef.current, []);

    return {
        state,
        dispatch,
        getState
    };
}
