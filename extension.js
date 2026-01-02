const vscode = require('vscode');

class RecentProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        return element;
    }

    async getChildren(element) {
        if (!element) {
            return [
                new vscode.TreeItem('文件夹', vscode.TreeItemCollapsibleState.Expanded),
                new vscode.TreeItem('文件', vscode.TreeItemCollapsibleState.Expanded)
            ];
        }

        const { workspaces, files } = await vscode.commands.executeCommand('_workbench.getRecentlyOpened');
        const config = {
            '文件夹': { items: workspaces.slice(0, 8), uriKey: 'folderUri', cmd: 'vscode.openFolder' },
            '文件': { items: files.slice(0, 12), uriKey: 'fileUri', cmd: 'vscode.open' }
        }[element.label];

        return config?.items.map(item => {
            const uri = vscode.Uri.parse(item[config.uriKey]);
            const treeItem = new vscode.TreeItem(uri);
            treeItem.command = { command: config.cmd, arguments: [uri] };
            return treeItem;
        }) || [];
    }
}

function activate(context) {
    const provider = new RecentProvider();

    const view = vscode.window.createTreeView('recentFilesView', { treeDataProvider: provider });
    view.onDidChangeVisibility(e => e.visible && provider.refresh());

    context.subscriptions.push(
        view,
        vscode.commands.registerCommand('recentFilesView.refresh', () => provider.refresh())
    );
}

function deactivate() { }

module.exports = { activate, deactivate };
