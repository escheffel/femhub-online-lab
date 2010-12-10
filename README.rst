FEMhub Online Lab SDK
=====================

This repository contains a Software Development Kit (SDK) 
for the FEMhub Online Laboratory (http://lab.femhub.org).
Its purpose is to allow users to develop their own open 
source applications and make them available to many users
of the Online Lab. While the SDK runs locally on your 
computer, the FEMhub Online Lab is powered with a powerful 
cloud. 
 
How to run it
-------------

(1) Install FEMhub using the instructions for developers
    http://femhub.org/devel.html/.
(2) Add the path to the femhub directory to your PATH.
(3) In the directory of the femhub-online-lab/ type::
    
        femhub -s spkg-install
    
    This will install the Online Lab SDK in your local FEMhub.
(4) Change dir to your local FEMhub directory and do::
    
        ./femhub
        lab(auth=False)
    
    Then open your browser (preferably Chrome or Firefox)
    at http://localhost:8000/. You should see a desktop-like
    setting with blue background and a few icons on the left.
(5) Double click on the "Module Basic" icon. You should see a simple
    mesh editor with a preloaded mesh. Click "submit" and the 
    tab should switch. Click "Run" and after approx. 4 seconds 
    (most of which are needed to initialize Mayavi plotting), 
    you should see a color map of computed solution. The equation 
    that this module solves is 

    -\mbox{div}(c_1 \nabla u) + (c_2, c_3)\cdot \nabla u + c_4 u = c_5.

    The piecewise-constant parameters c_1, c_2, ..., c_5 as well 
    as the boundary conditions can be changed in the simple menu 
    on the left.

How to write your own module
----------------------------

It is possible to create such graphical application
for every code that is in FEMhub. The only prerequisites are 
that the package has Python wrappers and that it is installed 
in FEMhub. The list of FEMhub packages can be found at 
http://femhub.org/codes.php.

The module Basic is written using the Hermes2D package. So in 
order to write a new module, first clone the git repository 
of Hermes2D using the instructions here: 
http://hpfem.org/hermes/doc/src/installation/linux.html.
The C++ source files of the module Basic can be found 
in .../hermes/hermes2d/modules/basic/. In order to create 
a new module, in .../hermes/hermes2d/modules/ do::

    cp -r basic/ my_module/

Add the new directory my_module/ to CMakeLists.txt, descend to
the directory my_module/, and change "basic.cpp" to "my_module.cpp"
and "hermes_basic" to "hermes_my_module". Rename the files "basic.h"
and "basic.cpp" to "my_module.h" and "my_module.cpp", respectively.
The file "my_module.cpp" needs to be included in "main.cpp", 
so you need to change the name there as well. Now do "cmake ."
in the directory hermes2d/, change dir to modules/my_module/ and 
type "make". Your new module should compile. Before adjusting it 
in any way you like, we recommend that you make its Python wrappers
operational.

How to create Python wrappers
-----------------------------

The python wrappers for the module Basic are in the directory
.../hermes/hermes2d/hermes2d/modules/basic/. Do not edit 
anything in this directory. Instead, change dir to 
.../hermes/hermes2d/hermes2d/modules/ and type::

    cp -r basic/ my_module/

Make appropriate adjustments in the CMakeLists.txt file both in the 
burrent directory and in the subdirectory my_module/. Replace "basic"
with "my_module" where appropriate. Go to hermes2d/ and type
"cmake .", and then go to hermes2d/hermes2d/modules/my_module/
and type "make". If the compilation succeeds, you are ready to 
start developing your new module!

How to write your own Javascript GUI
------------------------------------

The source code of the Javascript GUI is located in the 
femhub-online-lab repository in the file 
ui/js/femhub/femhub.module-basic.js. Copy this file to 
femhub.module-my_module.js and adjust the names as appropriate.
Icons ar elocated in ui/img/femhub/icons/. You will have to 
edit a few more files such as ui/css/femhub/femhub.icons.css
and ui/templates/femhub/femhub.html. To test your GUI, go to 
item (3) at the beginning of these instructions, install the 
updated Online Lab SDK in FEMhub, run FEMhub, and launch the 
lab.

Submitting your new application
-------------------------------

If you would like your application added to the FEMhub 
Online Lab at http://lab.femhub.org, send a message to 
the FEMhub mailing list femhub@googlegroups.com, and 
we'll take it from there!

These instructions are in development
-------------------------------------

The workflow is under development and so are these instructions.
We'll improve them in near future.