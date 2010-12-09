FEMhub.MeshEditor = Ext.extend(Ext.BoxComponent, {
    boxMinHeight: 500,
    boxMinWidth: 850,

    tpl: new Ext.Template('<object type="application/x-shockwave-flash" data="/static/external/MeshEditor.swf?rand={hash}" width="100%" height="100%"><param name="flashvars" value="output_cell=0&nodes=&elements=&boundaries=&curves=&var_name=m&mesh={mesh}" /><p>If you saw the mesh editor here and it disappeared, then you need to switch to the Model tab and back here again, and it will reappear. This is a known bug, but we don\'t know how to fix this. If you have never seen a mesh editor here,  you need to install flash.</p></object>'),

    initComponent: function() {
        FEMhub.MeshEditor.superclass.initComponent.call(this);

        this.addEvents("mesh_submitted");

        // We register a global callback to our mesh. This is a temporary
        // solution, it'd be better to access our instance from the flex editor
        // directly, but so far I don't know how.
        FEMhub.mesh_editor_set_mesh_scope = this;
        FEMhub.mesh_editor_set_mesh = function(mesh) {
            FEMhub.MeshEditor.prototype.set_mesh.
                call(FEMhub.mesh_editor_set_mesh_scope, mesh);
        };
    },

    mesh_str: "\
\n\
vertices =\n\
{\n\
  { 0, -1.0 },\n\
  { 1.0, -1.0 },\n\
  { -1.0, 0 },\n\
  { 0, 0 },\n\
  { 1.0, 0 },\n\
  { -1.0, 1.0 },\n\
  { 0, 1.0 },\n\
  { 0.70710678, 0.70710678 }\n\
}\n\
\n\
elements =\n\
{\n\
  { 0, 1, 4, 3, 0 },\n\
  { 3, 4, 7, 0 },\n\
  { 3, 7, 6, 0 },\n\
  { 2, 3, 6, 5, 0 }\n\
}\n\
\n\
boundaries =\n\
{\n\
  { 0, 1, 1 },\n\
  { 1, 4, 2 },\n\
  { 3, 0, 4 },\n\
  { 4, 7, 2 },\n\
  { 7, 6, 2 },\n\
  { 2, 3, 4 },\n\
  { 6, 5, 2 },\n\
  { 5, 2, 3 }\n\
}\n\
\n\
curves =\n\
{\n\
  { 4, 7, 45 },\n\
  { 7, 6, 45 }\n\
}",

    onRender: function() {
        FEMhub.MeshEditor.superclass.onRender.apply(this, arguments);

        this.reload_flash();
    },

    reload_flash: function() {
        uuid = FEMhub.util.rfc.UUID();
        this.tpl.overwrite(this.el, {hash: uuid, mesh: this.mesh_str});
    },

    set_mesh: function(mesh) {
        FEMhub.log("set_mesh() called, printing the mesh:");
        FEMhub.log(mesh);
        this.mesh_str = mesh;
        FEMhub.log("Firing event.");
        this.fireEvent("mesh_submitted", this);
        FEMhub.log("Done.");
    },

    get_mesh: function() {
        return this.mesh_str;
    },

});
