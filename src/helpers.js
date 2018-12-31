export const getCharacterAtIndex = (character, index) =>
	character
	+ `${index}`
		.split('')
		.map((digit) => String.fromCharCode(8320 + parseInt(digit)))
		.join('');

export const getRelativeLeftAndTop = ({ clientX, clientY, target }, margin = 0, getRoot) => {
	let root;
	if (getRoot) {
		root = target.classList.contains('space') ? target
			: target.parentNode.classList.contains('space')
				? target.parentNode
				: target.parentNode.parentNode.classList.contains('space')
					? target.parentNode.parentNode
					: target.parentNode.parentNode.parentNode;
	}
	const { x, y, width, height } = getRoot
	 	? root.getBoundingClientRect()
		: target.getBoundingClientRect();

	return ([
		// Top left corner coords
		(clientX - x - margin) / width,
		(clientY - y - margin) / height,
		// Center coords
		(clientX - x) / width,
		(clientY - y) / height,
		width
	]);
};

export const decodeTransitionString = (inputText, acceptCb, rejectCb) => {
	const transitionList = inputText.replace(/\s/g, '').split(',');
	const fullTransitionList = [];
	transitionList.forEach((symbol) => {
		if (symbol.includes('...')) {
			const [leftOperand, rightOperand] = symbol.split('...');
			const readFrom = leftOperand.charCodeAt(0);
			const readTo = rightOperand.charCodeAt(0);
			if (readFrom < 65 || (readFrom > 90 && readFrom < 97) || readFrom > 122)
				return rejectCb && rejectCb();
			if (readTo < 65 || (readTo > 90 && readTo < 97) || readTo > 122)
				return rejectCb && rejectCb();
			if (leftOperand < rightOperand) {
				for (let dec = readFrom; dec <= readTo; dec++) {
					if (dec > 90 && dec < 97) continue;
					if (!fullTransitionList.includes(String.fromCharCode(dec)))
						fullTransitionList.push(String.fromCharCode(dec));
				}
			} else {
				for (let dec = readFrom; dec >= readTo; dec--) {
					if (dec > 90 && dec < 97) continue;
					if (!fullTransitionList.includes(String.fromCharCode(dec)))
						fullTransitionList.push(String.fromCharCode(dec));
				}
			}
		} else {
			if (!fullTransitionList.includes(symbol)) {
				if (symbol === '$') {
					if (!fullTransitionList.includes('λ')) fullTransitionList.push('λ');
				} else {
					fullTransitionList.push(symbol);
				}
			}
		}
	});
	if (acceptCb) acceptCb();
	return fullTransitionList;
};

export const checkDFA = (transitions) => {
	try {
		transitions.forEach((trans1) => {
			transitions.forEach((trans2) => {
				if (trans1.id === trans2.id) return;
				if (trans1.startNode.id === trans2.startNode.id) {
					trans1.acceptedSymbols.forEach((sym) => {
						if (trans2.acceptedSymbols.includes(sym) || sym === 'λ') throw new Error('IS_NFA');
					});
				}
			});
		});
	} catch {
		return false;
	}
	return true;
};

export const testInput = (states, transitions, acceptedLanguage, _input) => {
	const input = _input.replace(/\s/g, '');
	const unexpectedCharacters = input
		.split('')
		.filter((sym) => !acceptedLanguage.includes(sym).length === 0);
	if (unexpectedCharacters.length !== 0)
		return { success: false, msg: 'CHARACTER_OUT_OF_BOUNDS',	data: unexpectedCharacters };

	const initialStates = states.filter((state) => state.initial);
	if (initialStates.length === 0)
		return {	success: false, msg: 'NO_INITIAL_STATE_FOUND' };

	const finalStates = states.filter((state) => state.final);
	if (finalStates.length === 0)
		return { success: false, msg: 'NO_FINAL_STATE_FOUND' };

	const isDFA = checkDFA(transitions);
	const firstInitialState = initialStates[0];

	/*
	 *
	 */
	const readNextState = (currentState, symbol) => {
		const currentStateTransitions = transitions
			.filter((trans) => trans.startNode.id === currentState.id);

		const acceptedTransitions = currentStateTransitions
			.filter((trans) => trans.acceptedSymbols.includes(symbol.charAt(0)));

		if (acceptedTransitions.length === 0)
			return { success: false, msg: 'UNACCEPTED_INPUT' };

		if (isDFA)
			return { success: true, data: acceptedTransitions[0].endNode };
		else
			return { success: true, data: acceptedTransitions.map((tr) => tr.endNode) };
	};

	/*
	 *
	 */
	 const solveDFA = () => {
	 	let currentStandingState = initialStates[0];
	 	let traversalPath = `${currentStandingState.symbol} --`;

	 	input.split('').forEach((symbol) => {
	 		if (!currentStandingState) return;
	 		const { success, data } = readNextState(currentStandingState, symbol);
	 		traversalPath += `(${symbol})-- ➡ ${data && `${data.symbol} --` || 'DEAD'}`;
	 		if (!success) {
	 			currentStandingState = null;
	 			return;
	 		}
	 		currentStandingState = states.filter(({ id }) => data.id === id)[0];
	 	});

	 	const accepted = currentStandingState && Boolean(currentStandingState.final);
	 	traversalPath = accepted
	 		? traversalPath.substring(0, traversalPath.length - 2)
	 			+ ` |===| ${currentStandingState.symbol} is final => ${input} is ACCEPTED`
	 		: traversalPath;
	 	return {
	 		accepted,
	 		success: true,
	 		traversalPath,
	 		currentStandingState
	 	};
	 };

	 /*
	 *
	 */
	 const removeLambda = (currentState, nextOptions) => {
		return nextOptions.reduce((accu, optionState) => {
			const transition = transitions
				.filter(({ startNode, endNode }) =>
					startNode.id === currentState.id && endNode === optionState.id);
			if (transition.acceptedSymbols.includes('λ')) accu.push(optionState);
			return accu;
		}, []);
	 };

	 /*
	  *
	  */
	const NFAPath = [];
	let lastStandingState = {};
	let pop = true;
	const solveNFA = (initialStates, remainingInput) => {
		if (remainingInput.length === 0) {
			const end = initialStates.reduce((accu, curr) => {
				const currentState = states.filter((st) => st.id === curr.id)[0];
				const solution = accu || !!currentState.final;
				if (solution) {
					NFAPath.push({ symbol: currentState.symbol });
					lastStandingState = currentState;
					pop = false;
				}
				return solution;
			}, false);
			return end;
		}
		return initialStates.reduce((accu, state) => {
			const nextOptions = readNextState(state, remainingInput);
			if (!nextOptions.success) return false;
			const solution = accu || solveNFA(nextOptions.data, remainingInput.substring(1));
			NFAPath.push({ symbol: state.symbol, input: remainingInput.charAt(0) });
			if (pop) NFAPath.pop();
			return solution;
		}, false);
	 };

	 const solution = isDFA ? solveDFA() : {
		 accepted: solveNFA(initialStates, input),
		 traversalPath: NFAPath.reverse().reduce((accum, curr) => {
			 return accum + `${curr.symbol}${curr.input ? `--${curr.input}-- ➡ ` : ''}`;
		 }, ''),
		 success: true,
		 currentStandingState: lastStandingState
	 };
	 return solution;
};
