import { useRef, useEffect, useReducer } from "react";
export function useChannel(
	name,
	size = 5
): [
	{
		lastMessage: string;
		total: number;
		messages: string[];
	},
	(string) => void
] {
	const [messageState, dispatch] = useReducer(
		(state, data) => {
			state.lastMessage = data;
			state.messages[state.cursor % size] = data;
			state.cursor++;
			state.total++;
			return state;
		},
		{
			lastMessage: null,
			messages: new Array(size).fill(""),
			cursor: 0,
			total: 0,
		}
	);

	let channel = useRef(new BroadcastChannel(name));
	function postMessage(msg) {
		channel.current.postMessage(msg);
	}

	useEffect(() => {
		channel.current.onmessage = function ({ data }) {
			dispatch(data);
		};
		return function cleanup() {
			channel.current && channel.current.close();
			channel = null;
		};
	}, [name]);
	return [
		{
			lastMessage: messageState.lastMessage,
			total: messageState.cursor,
			messages:
				messageState.cursor > size
					? messageState.messages
							.slice(0, (messageState.cursor % size) - 1)
							.concat(["*" + messageState.messages[(messageState.cursor % size) - 1]])
							.concat(messageState.messages.slice((messageState.cursor % size) - 1))
					: messageState.messages.slice(0, messageState.cursor + 1),
		},
		postMessage,
	];
}
