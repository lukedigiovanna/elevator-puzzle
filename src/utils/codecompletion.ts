import { Monaco } from "@monaco-editor/react";

function createVariableProposals(monaco: Monaco, range: any) {
	return [
		{
			label: 'elevator',
			kind: monaco.languages.CompletionItemKind.Variable,
			documentation: 'Control elevator',
			insertText: 'elevator',
			range
		},
        {
            label: 'building',
            kind: monaco.languages.CompletionItemKind.Variable,
            documentation: 'Get building information',
            insertText: 'building',
            range
        },
        {
            label: 'log',
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: 'Log a message to the console',
            insertText: 'log',
            range
        }
	];
}

function createElevatorFunctionProposals(monaco: Monaco, range: any) {
    return [
        {
            label: 'goto',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Send elevator to given level',
            insertText: 'goto()',
            range
        }
    ]
}


function createCompletionFunction(monaco: Monaco) {
    return function(model: any, position: any) {
        const word = model.getWordUntilPosition(position);
        const lineContent = model.getLineContent(position.lineNumber) as string;
        console.log(lineContent);
        
        var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        };

		if (lineContent.endsWith('elevator.')) {
			return { 
                suggestions: createElevatorFunctionProposals(monaco, range)
            };
		}

        return {
            suggestions: [...createVariableProposals(monaco, range), ...createElevatorFunctionProposals(monaco, range)]
        };   
    }
}

export { createCompletionFunction };