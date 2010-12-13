After the file FEMhub.ModuleBasicWindow.ui.js is regenerated,
the status bar will disappear. It can be added into the 
component where it belongs to (currently into the computation_setup
panel) via:

                        bbar: new FEMhub.Statusbar({
                            busyText: '',
                            defaultText: '',
                        }),

before "items".
