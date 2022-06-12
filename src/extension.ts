import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('node:path');

type TempInfo = {
	name: string,
	fileExt: string,
	filePath: string,
	fileTemplatePath: string,
	param: string[]
}

type TempType = {
	param: string[],
	templates: TempInfo[]
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('jerrygencode.gencode', (ns, name) => {

		let wkfs = vscode.workspace.workspaceFolders;
		if (!wkfs) { return; }
		let rootPath = wkfs[0].uri.fsPath;
		let conf = vscode.workspace.getConfiguration().get<TempType>("JerryGenCode");

		conf?.templates.forEach(t => {
			let distContent = fs.readFileSync(rootPath + "/.vscode/templates/" + t.fileTemplatePath, 'utf8');
			let distDir = rootPath + "\\" + t.filePath;
			let distFileName = "";
			if (!fs.existsSync(distDir)) { mkdirsSync(distDir); }

			if (conf && conf.param) {
				distContent = handleReplace(distContent, conf.param);
				distFileName = getConfFileName(conf.param);
			}

			if (t.param) {
				distContent = handleReplace(distContent, t.param);
			}

			if(fs.existsSync(distDir + distFileName + t.fileExt)){
				vscode.window.showErrorMessage(distFileName + t.fileExt+"文件已存在，请重新命名");
				return;
			}

			fs.writeFileSync(distDir + distFileName + t.fileExt, distContent);

			console.log(distDir + distFileName + t.fileExt+' 生成成功！');
		});

		vscode.window.showInformationMessage('生成成功！');

	});

	context.subscriptions.push(disposable);
}

function handleReplace(distContent: string, param: string[]) {
	param.forEach(p => {
		let ps = p.split("=");
		distContent = distContent.replace(new RegExp("~" + ps[0] + "~", "g"), ps[1]);
	});
	return distContent;
}

function getConfFileName(param: string[]) {
	for (const p in param) {
		if (param[p].startsWith("fileName=")) {
			return param[p].split("=")[1];
		}
	}
	return "";
}


// 递归创建目录 同步方法
function mkdirsSync(dirname: string) {
	if (fs.existsSync(dirname)) {
		return true;
	} else {
		if (mkdirsSync(path.dirname(dirname))) {
			fs.mkdirSync(dirname);
			return true;
		}
	}
}

export function deactivate() { }
