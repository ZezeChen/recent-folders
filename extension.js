const vscode = require('vscode');

async function fetchRecent() {
    const result = await vscode.commands.executeCommand('_workbench.getRecentlyOpened').catch(() => ({}));
    return result?.workspaces || [];
}

const provider = {
    _emitter: new vscode.EventEmitter(),
    get onDidChangeTreeData() { return this._emitter.event; },
    refresh() { this._emitter.fire(); },
    
    getTreeItem({ uri, name }) {
        const item = new vscode.TreeItem(name);
        item.iconPath = new vscode.ThemeIcon('folder');
        item.tooltip = uri.fsPath;
        item.command = { command: 'vscode.openFolder', arguments: [uri] };
        return item;
    },
    
    async getChildren(element) {
        if (element) return [];
        const folders = await fetchRecent();
        const max = vscode.workspace.getConfiguration('recentFolders').get('maxItems', 10);
        return folders.slice(0, max).map(folder => {
            const uri = vscode.Uri.parse(folder.folderUri);
            const name = uri.fsPath.split(/[\\/]/).pop();
            return { uri, name };
        });
    }
};

function activate(ctx) {
    ctx.subscriptions.push(
        vscode.window.createTreeView('recentFoldersView', { treeDataProvider: provider }),
        vscode.commands.registerCommand('recentFoldersView.refresh', () => provider.refresh()),
        vscode.workspace.onDidChangeConfiguration(e => e.affectsConfiguration('recentFolders') && provider.refresh())
    );
}

module.exports = { activate };
