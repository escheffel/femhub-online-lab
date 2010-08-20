
FEMhub.Bookshelf = Ext.extend(Ext.Window, {
    toolbar: null,
    enginesMenu: null,
    foldersTree: null,
    notebooksGrid: null,

    defaultEngine: null,

    constructor: function(config) {
        this.initToolbar();
        this.initEnginesMenu();
        this.initFoldersTree();
        this.initNotebooksGrid();

        config = config || {};

        Ext.apply(config, {
            title: "FEMhub Bookshelf",
            layout: 'border',
            width: 700,
            height: 500,
            iconCls: 'femhub-bookshelf-icon',
            maximizable: true,
            minimizable: true,
            closable: true,
            onEsc: Ext.emptyFn,
            tbar: this.toolbar,
            items: [this.foldersTree, this.notebooksGrid],
        });

        FEMhub.Bookshelf.superclass.constructor.call(this, config);
    },

    initToolbar: function() {
        this.toolbar = new Ext.Toolbar({
            items: [
                {
                    xtype: 'tbsplit',
                    cls: 'x-btn-text-icon',
                    icon: FEMhub.icons + 'page_add.png',
                    text: 'New Notebook',
                    handler: function() {
                        this.newNotebook(this.defaultEngine);
                    },
                    menu: this.enginesMenu,
                    scope: this,
                }, {
                    xtype: 'button',
                    cls: 'x-btn-text-icon',
                    icon: FEMhub.icons + 'page_attach.png',
                    text: 'Import Notebook',
                    handler: function() {
                        Ext.MessageBox.prompt(
                            'Import Notebook',
                            'Please enter plain text:',
                            function(button, text) {
                                if (button == 'ok') {
                                    this.newNotebook(this.defaultEngine, function(notebook) {
                                        notebook.importCells(text);
                                    });
                                }
                            }, this, true);
                    },
                    scope: this,
                },
            ],
        });
    },

    initEnginesMenu: function() {
        this.enginesMenu = new Ext.menu.Menu();

        FEMhub.RPC.getEngines({}, function(engines) {
            this.defaultEngine = engines[0].id;

            Ext.each(engines, function(engine) {
                this.enginesMenu.addMenuItem({
                    engine: engine.id,
                    text: engine.name,
                    handler: function(item) {
                        this.newNotebook(item.engine);
                    },
                    scope: this,
                });
            }, this);
        }, this);
    },

    initFoldersTree: function() {
        this.root = new Ext.tree.TreeNode();

        this.foldersTree = new Ext.tree.TreePanel({
            region: 'west',
            width: 200,
            split: true,
            root: this.root,
            rootVisible: false,
            animate: true,
            enableDD: true,
            containerScroll: true,
        });

        this.foldersTree.on('contextmenu', function(node, evt) {
            var context = new Ext.menu.Menu({
                items: [{
                    text: 'New folder',
                    handler: function() {
                        this.addFolder(node);
                    },
                    scope: this,
                }, '-', {
                    text: 'Rename',
                    handler: function() {
                        this.renameFolder(node);
                    },
                    scope: this,
                }, {
                    text: 'Delete',
                    handler: function() {
                        this.deleteFolder(node);
                    },
                    scope: this,
                }],
            });

            context.showAt(evt.getXY());
            evt.stopEvent();
        }, this);

        this.foldersTree.on('click', function(node) {
            if (node.id == this.rootNode.id) {
                var id = 'root'; // XXX: hack
            } else {
                var id = node.id;
            }

            Ext.Ajax.request({
                url: '/bookshelf/load?location=' + id + '&order=title&sort=asc',
                method: "GET",
                success: function(result, request) {
                    var result = Ext.decode(result.responseText);
                    this.notebooksGrid.getStore().removeAll();

                    Ext.each(result, function(notebook) {
                        var rec = Ext.data.Record.create(['title', 'engine', 'date']);

                        this.notebooksGrid.getStore().add(new rec({
                            title: notebook[1],
                            engine: notebook[2],
                            date: notebook[3],
                        }, notebook[0]));
                    }, this);
                },
                failure: Ext.emptyFn,
                scope: this,
            });
        }, this);

        this.fillFoldersTree();
    },

    initNotebooksGrid: function() {
        this.notebooksGrid = new Ext.grid.GridPanel({
            border:false,
            ds: new Ext.data.Store({
                reader: new Ext.data.ArrayReader({}, [
                    { name: 'title' },
                    { name: 'engine' },
                    { name: 'date', type: 'date' },
                ]),
            }),
            cm: new Ext.grid.ColumnModel([
                new Ext.grid.RowNumberer(),
                { header: "Title", width: 200, sortable: true, dataIndex: 'title'},
                { header: "Engine", width: 70, sortable: true, dataIndex: 'engine'},
                { header: "Date", width: 100, sortable: true, dataIndex: 'date'},
            ]),
            viewConfig: {
                forceFit: true,
            },
            region: 'center',
        });

        this.notebooksGrid.on('celldblclick', function(grid, row, col, evt) {
            var record = grid.getStore().getAt(row);
            this.openNotebook(record.id, record.data.title);
        }, this);

        this.notebooksGrid.on('rowcontextmenu', function(grid, row, evt) {
            var context = new Ext.menu.Menu({
                items: [{
                    text: 'Open',
                    handler: function() {
                        var record = grid.getStore().getAt(row);
                        this.openNotebook(record.id, record.data.title);
                    },
                    scope: this,
                }, '-', {
                    text: 'Share',
                    handler: function() {
                        FEMhub.log("share");
                    },
                    scope: this,
                }, {
                    text: 'Rename',
                    handler: function() {
                        FEMhub.log("rename");
                    },
                    scope: this,
                }, {
                    text: 'Delete',
                    handler: function() {
                        FEMhub.log("delete");
                    },
                    scope: this,
                }],
            });

            context.showAt(evt.getXY());
            evt.stopEvent();
        }, this);
    },

    newNotebook: function(engine, handler, scope) {
        FEMhub.RPC.newNotebook({ engine_id: engine }, function(data) {
            var notebook = this.openNotebook(data.id, 'untitled');

            if (Ext.isDefined(handler)) {
                handler.call(scope || this, notebook);
            }
        }, this);
    },

    openNotebook: function(id, title) {
        var desktop = FEMhub.lab.getDesktop();

        var notebook = desktop.createWindow(FEMhub.Notebook, {
            id: id,
            name: title,
            width: 600,
            height: 400,
        });

        notebook.show();
        return notebook;
    },

    isRootNode: function(node) {
        return node.id == this.rootNode.id;
    },

    fillFoldersTree: function() {
        function recFillFoldersTree(node) {
            FEMhub.RPC.Folders.getFolders({guid: node.id}, function(folders) {
                Ext.each(folders, function(folder) {
                    var subNode = new Ext.tree.TreeNode({
                        id: folder.guid,
                        text: folder.title,
                    });

                    node.appendChild(subNode);
                    recFillFoldersTree(subNode);
                });

                node.expand();
            });
        }

        FEMhub.RPC.Folders.getRoot({}, function(folder) {
            this.rootNode = new Ext.tree.TreeNode({
                id: folder.guid,
                text: folder.title,
            });

            this.root.appendChild(this.rootNode);
            recFillFoldersTree(this.rootNode);
        }, this);
    },

    isValidFolderName: function(name) {
        return /^[a-z0-9_][a-z0-9_-]*/i.test(name) && name.length < 100;
    },

    addFolder: function(node) {
        Ext.MessageBox.prompt('Add folder', 'Enter folder name:', function(button, title) {
            if (button === 'ok') {
                if (this.isValidFolderName(title) === false) {
                    Ext.MessageBox.show({
                        title: 'Add folder',
                        msg: "Invalid folder name.",
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR,
                    });
                } else {
                    FEMhub.RPC.Folders.addFolder({guid: node.id, title: title}, function(result) {
                        if (result.ok === true) {
                            node.appendChild(new Ext.tree.TreeNode({
                                id: result.guid,
                                text: title,
                            }));

                            node.expand();
                        } else {
                            FEMhub.log("Can't create folder");
                        }
                    });
                }
            }
        }, this);
    },

    renameFolder: function(node) {
        if (this.isRootNode(node)) {
            Ext.MessageBox.show({
                title: 'Rename folder',
                msg: "Can't rename root node. Sorry. ",
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.ERROR,
            });
        } else {
            Ext.MessageBox.prompt('Rename folder', 'Enter new folder name:', function(button, title) {
                if (button === 'ok') {
                    if (this.isValidFolderName(title) === false) {
                        Ext.MessageBox.show({
                            title: 'Rename folder',
                            msg: "Invalid folder name.",
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR,
                        });
                    } else {
                        FEMhub.RPC.Folders.renameFolder({guid: node.id, title: title}, function(result) {
                            if (result.ok === true) {
                                node.setText(title);
                            } else {
                                FEMhub.log("Can't rename folder");
                            }
                        });
                    }
                }
            }, this);
        }
    },

    deleteFolder: function(node) {
        if (this.isRootNode(node)) {
            Ext.MessageBox.show({
                title: 'Delete folder',
                msg: "Can't delete root node. Sorry. ",
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.ERROR,
            });
        } else {
            Ext.MessageBox.show({
                title: 'Delete folder',
                msg: 'Do you really want to delete selected folder and all its contents?',
                buttons: Ext.MessageBox.YESNO,
                icon: Ext.MessageBox.QUESTION,
                fn: function(button) {
                    if (button === 'yes') {
                        FEMhub.RPC.Folders.deleteFolder({guid: node.id}, function(result) {
                            if (result.ok === true) {
                                node.remove(true);
                            } else {
                                FEMhub.log("Can't delete folder");
                            }
                        });
                    }
                },
                scope: this,
            });
        }
    },
});

FEMhub.Modules.Bookshelf = Ext.extend(FEMhub.Module, {
    launcher: {
        text: 'Bookshelf',
        icon: 'femhub-bookshelf-launcher-icon',
    },
    winCls: FEMhub.Bookshelf,
});

