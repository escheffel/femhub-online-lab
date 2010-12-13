
FEMhub.ModuleBasic = Ext.extend(FEMhub.ModuleBasicWindowUi, {
    initComponent: function() {
        FEMhub.ModuleBasic.superclass.initComponent.call(this);
        this.my_init();
        this.mesh_editor = new FEMhub.MeshEditor();
        this.geometry_tab.add(this.mesh_editor);
        this.model_parameters.add([this.boundary_conditions_window, this.materials_window]);

        this.statusbar = this.computation_setup.getBottomToolbar();
        this.uuid = 0;

        this.computation_run.on("click", this.run, this);
        this.mesh_editor.on("mesh_submitted", function() {
            FEMhub.log("Mesh saved. Turning into the Model tab");
            this.main_tabs.setActiveTab(1);
        }, this);
        this.main_tabs.on("tabchange", function () {
            FEMhub.log("Tab changed, refreshing the flex mesh editor.");
            this.mesh_editor.reload_flash();
        }, this);

    },
    my_init: function () {
        
        // window to display boundary conditions
        this.boundary_conditions_window = new Ext.Panel({
            title: 'Boundary conditions',
            margins:'3 10 3 3',
            cmargins:'3 3 3 3',

            items: [{
		xtype: 'box',
                height: '10',
                html: "",
		}, {
		xtype: 'box',
                html: "Dirichlet markers:",
		}, {
                xtype: 'textfield',
                id: "BC_dir_marker",
                value: '4',
		}, {
		xtype: 'box',
                html: "Dirichlet values:",
		}, {
                xtype: 'textfield',
                id: "BC_dir_value",
                value: '0',
                }, {
		xtype: 'box',
                html: "Neumann markers:",
		}, {
                xtype: 'textfield',
                id: "BC_neumann_marker",
                value: '1, 3',
		}, {
		xtype: 'box',
                html: "Neumann values:",
		}, {
                xtype: 'textfield',
                id: "BC_neumann_value",
                value: '0, 0',
		}, {
		xtype: 'box',
                html: "Newton markers:",
		}, {
                xtype: 'textfield',
                id: "BC_newton_marker",
                value: '2',
		}, {
		xtype: 'box',
                html: "Newton values:",
		}, {
                xtype: 'textfield',
                id: "BC_newton_value",
                value: '(1, 1)',
		}, {
		xtype: 'box',
                height: '10',
                html: "",
		}], 
	    });

        // window to display equation parameters
        this.materials_window = new Ext.Panel({
            title: 'Equation data',
            margins:'3 10 3 3',
            cmargins:'3 3 3 3',

            items: [{
		xtype: 'box',
                height: '10',
                html: "",
		}, {
		xtype: 'box',
                html: "Material markers:",
		}, {
                xtype: 'textfield',
                id: "Mat_marker",
                value: '0',
		}, {
		xtype: 'box',
                html: "Const c1:",
		}, {
                xtype: 'textfield',
                id: "Mat_c1",
                value: '1',
		}, {
		xtype: 'box',
                html: "Const c2:",
		}, {
                xtype: 'textfield',
                id: "Mat_c2",
                value: '0',
		}, {
		xtype: 'box',
                html: "Const c3:",
		}, {
                xtype: 'textfield',
                id: "Mat_c3",
                value: '0',
		}, {
		xtype: 'box',
                html: "Const c4:",
		}, {
                xtype: 'textfield',
                id: "Mat_c4",
                value: '0',
		}, {
		xtype: 'box',
                html: "Const c5:",
		}, {
                xtype: 'textfield',
                id: "Mat_c5",
                value: '1',
		}, {
		xtype: 'box',
                height: '10',
                html: "",
		}], 
	    });
    },

    initToolbar: function() {
        return new Ext.Toolbar({
            enableOverflow: true,
            items: [{
                xtype: 'button',
                cls: 'x-btn-text-icon',
                text: 'Run',
                iconCls: 'femhub-add-worksheet-icon',
                handler: function() {
                    this.run();
                },
                scope: this,
            }],
        });
    },

    run: function() {
	// Input box for initial poly degree.
        Init_p_val = this.computation_setup.get("Init_p").getValue();
        FEMhub.log("Init_p_val: " + Init_p_val);

	// Input box for initial refinements.
        Init_ref_num_val = this.computation_setup.get("Init_ref_num").getValue();
        FEMhub.log("Init_ref_num_val: " + Init_ref_num_val);

	// Input box for matrix solver.
        Matrix_solver_val = this.computation_setup.get("Matrix_solver").getValue();
        FEMhub.log("Matrix solver: " + Matrix_solver_val);

	// Input box for Dirichlet markers.
        BC_dir_marker_val = this.boundary_conditions_window.get("BC_dir_marker").getValue();
        FEMhub.log("BC_dir_marker_val: " + BC_dir_marker_val);

	// Input box for Dirichlet values.
        BC_dir_value_val = this.boundary_conditions_window.get("BC_dir_value").getValue();
        FEMhub.log("BC_dir_value_val: " + BC_dir_value_val);

	// Input box for Neumann markers.
        BC_neumann_marker_val = this.boundary_conditions_window.get("BC_neumann_marker").getValue();
        FEMhub.log("BC_neumann_marker_val: " + BC_neumann_marker_val);

	// Input box for Neumann values.
        BC_neumann_value_val = this.boundary_conditions_window.get("BC_neumann_value").getValue();
        FEMhub.log("BC_neumann_value_val: " + BC_neumann_value_val);

	// Input box for Newton markers.
        BC_newton_marker_val = this.boundary_conditions_window.get("BC_newton_marker").getValue();
        FEMhub.log("BC_newton_marker_val: " + BC_newton_marker_val);

	// Input box for Newton values.
        BC_newton_value_val = this.boundary_conditions_window.get("BC_newton_value").getValue();
        FEMhub.log("BC_newton_value_val: " + BC_newton_value_val);

	// Input box for material markers.
        Mat_marker_val = this.materials_window.get("Mat_marker").getValue();
        FEMhub.log("Mat_marker_val: " + Mat_marker_val);

	// Input box for equation constants c1.
        Mat_c1_val =  this.materials_window.get("Mat_c1").getValue();
        FEMhub.log("Mat_c1_val: " + Mat_c1_val);

	// Input box for equation constants c2.
        Mat_c2_val =  this.materials_window.get("Mat_c2").getValue();
        FEMhub.log("Mat_c2_val: " + Mat_c2_val);

	// Input box for equation constants c3.
        Mat_c3_val =  this.materials_window.get("Mat_c3").getValue();
        FEMhub.log("Mat_c3_val: " + Mat_c3_val);

	// Input box for equation constants c4.
        Mat_c4_val =  this.materials_window.get("Mat_c4").getValue();
        FEMhub.log("Mat_c4_val: " + Mat_c4_val);

	// Input box for material constants c5.
        Mat_c5_val =  this.materials_window.get("Mat_c5").getValue();
        FEMhub.log("Mat_c5_val: " + Mat_c5_val);


        // Source code (first and second part --- the mesh is inserted in
        // between using this.mesh_editor.get_mesh(), see below)
        this.sourcecode1 = "\
from hermes2d.modules.basic import ModuleBasic\n\
from hermes2d.hermes2d import Linearizer\n\
from hermes2d.plot import sln2png, plot_sln_mayavi\n\
from femhub.plot import return_mayavi_figure\n\
\n\
mesh = \"\"\"\n";

        this.sourcecode2 = "\"\"\"\n\
\n\
def main():\n\
    e = ModuleBasic()\n\
    e.set_mesh_str(mesh)\n\
    e.set_initial_mesh_refinement(" + Init_ref_num_val + ")\n\
    e.set_initial_poly_degree(" + Init_p_val + ")\n\
    e.set_matrix_solver(\"" + Matrix_solver_val + "\")\n\
    e.set_material_markers([" + Mat_marker_val + "])\n\
    e.set_c1_array([" + Mat_c1_val + "])\n\
    e.set_c2_array([" + Mat_c2_val + "])\n\
    e.set_c3_array([" + Mat_c3_val + "])\n\
    e.set_c4_array([" + Mat_c4_val + "])\n\
    e.set_c5_array([" + Mat_c5_val + "])\n\
    e.set_dirichlet_markers([" + BC_dir_marker_val + "])\n\
    e.set_dirichlet_values([" + BC_dir_marker_val + "], [" + BC_dir_value_val + "])\n\
    e.set_neumann_markers([" + BC_neumann_marker_val + "])\n\
    e.set_neumann_values([" + BC_neumann_value_val + "])\n\
    e.set_newton_markers([" + BC_newton_marker_val + "])\n\
    e.set_newton_values([" + BC_newton_value_val + "])\n\
    success = e.calculate()\n\
    assert success is True\n\
    sln = e.get_solution()\n\
    fig = plot_sln_mayavi(sln, offscreen=True)\n\
    return_mayavi_figure(fig)\n\
\n\
main()";

            this.sourcecode_generated = this.sourcecode1 +
                this.mesh_editor.get_mesh() + this.sourcecode2;

            if (this.uuid == 0) {
                // we need to initialize a new engine
                this.uuid = FEMhub.util.rfc.UUID();
                FEMhub.log("UUID created" + this.uuid);
                FEMhub.RPC.Engine.init({uuid: this.uuid}, {
                    okay: function(result) {
                        FEMhub.log("Engine initialized");
                        this.run2_evaluate(this.uuid,
                            this.sourcecode_generated);
                        FEMhub.log("Evaluate called");
                        FEMhub.log(this.sourcecode_generated);
                    },
                    fail: function(reason, result) {
                        FEMhub.msg.info("Engine failed to initialize");
                        FEMhub.log("Engine failed to initialize");
                    },
                    scope: this,
                    status: {
                        start: function() {
                            this._id = this.statusbar.showBusy({text: "Initializing the engine"});
                        },
                        end: function(ok, ret) {
                            this.statusbar.clearBusy(this._id);
                        },
                    },
                });
            } else {
                // We reuse a running engine
                this.run2_evaluate(this.uuid, this.sourcecode_generated);
            }
    },

    run2_evaluate: function(uuid, source) {
            FEMhub.RPC.Engine.evaluate({
                uuid: uuid,
                source: source,
            }, {
                okay: function(result) {
                    FEMhub.log("Evaluate succeeded");
                    this.run3_result(result);
                },
                fail: function() {
                    FEMhub.msg.info("Evaluate failed (engine was killed)");
                    FEMhub.log("Evaluate failed");
                },
                scope: this,
                status: {
                    start: function() {
                        this._id = this.statusbar.showBusy({text: "Calculating"});
                    },
                    end: function(ok, ret) {
                        this.statusbar.clearBusy(this._id);
                    },
                    scope: this,
                },
            });
    },

    run3_result: function(result) {
            FEMhub.log("Results received");
            FEMhub.log(result);
            if (result.traceback_html) {
                //FEMhub.msg.error("Python traceback", result.traceback_html);
                d = this.model_solution;
                d.update("Python traceback:<br/><pre>" + result.traceback_html + "</pre>");
                FEMhub.log(result.traceback_html);
            } else {
                data = result.plots[0].data;
		this.main_tabs.setActiveTab(3);
                d = this.model_solution;
                d.update('<table height="100%" width="100%" border="0"><tr><td valign="middle" align="center"><img src="data:image/png;base64,' + data + '"/></td></tr></table>');
            }
    },

});

FEMhub.Modules.ModuleBasic = Ext.extend(FEMhub.Module, {
    launcher: {
        text: 'Module Basic',
        icon: 'femhub-module-basic-launcher-icon',
    },
    winCls: FEMhub.ModuleBasic,
});
