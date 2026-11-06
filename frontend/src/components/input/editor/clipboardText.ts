import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// Plain text for copies out of the editor. Lists keep their markers so the copied text
// still reads as a list when pasted into a plain text field; every other block stays one line.

function listMarker(list: ProseMirrorNode, item: ProseMirrorNode, index: number): string {
	if (list.type.name === 'orderedList') {
		return `${(list.attrs.start ?? 1) + index}. `
	}
	if (list.type.name === 'taskList') {
		return item.attrs.checked ? '- [x] ' : '- [ ] '
	}
	return '- '
}

function listLines(list: ProseMirrorNode): string[] {
	const lines: string[] = []
	list.forEach((item, _offset, index) => {
		const marker = listMarker(list, item, index)
		const continuation = ' '.repeat(marker.length)
		const itemLines = nodeLines(item)
		itemLines.forEach((line, lineIndex) => {
			lines.push((lineIndex === 0 ? marker : continuation) + line)
		})
	})
	return lines
}

function nodeLines(node: ProseMirrorNode): string[] {
	if (node.type.name === 'bulletList' || node.type.name === 'orderedList' || node.type.name === 'taskList') {
		return listLines(node)
	}
	if (node.isTextblock) {
		return [node.textContent]
	}
	const lines: string[] = []
	node.forEach(child => {
		lines.push(...nodeLines(child))
	})
	return lines
}

export function serializeSliceAsText(slice: Slice): string {
	const lines: string[] = []
	slice.content.forEach(node => {
		lines.push(...nodeLines(node))
	})
	return lines.join('\n')
}
