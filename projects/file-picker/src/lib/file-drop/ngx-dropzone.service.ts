import { Injectable } from '@angular/core';
import { FileSelectResult } from './file-drop.models';


/**
 * This service contains the filtering logic to be applied to
 * any dropped or selected file. If a file matches all criteria
 * like maximum size or accept type, it will be emitted in the
 * addedFiles array, otherwise in the rejectedFiles array.
 */
@Injectable()
export class FileDropService {

	public parseFileList(files: FileList): FileSelectResult {

		const addedFiles: File[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files.item(i);

			addedFiles.push(file);
		}

		const result: FileSelectResult = {
			addedFiles,
		};

		return result;
	}

}