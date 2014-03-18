<?php

/**
 * @author:  Gabriel BONDAZ <gabriel.bondaz@idci-consulting.fr>
 * @license: MIT
 */

namespace Tms\Bundle\FormGeneratorBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraints\LessThanValidator;

class DateLessThanValidator extends LessThanValidator
{
    /**
     * @inheritDoc
     */
    protected function compareValues($value1, $value2)
    {
        $value1 = DateValidatorTool::cleanDateValue($value1);
        $value2 = DateValidatorTool::cleanDateValue($value2);

        if (!$value1 || !$value2) {
            return false;
        }

        return parent::compareValues($value1, $value2);
    }
}
