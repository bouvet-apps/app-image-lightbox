package no.bouvet.diagora;

import com.enonic.xp.testing.ScriptRunnerSupport;

/* Test a controller by adding a class (.java-file) for the test */
public class ImageLibTest extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/lib/imagelib-test.js";
    }
}
