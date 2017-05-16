<?php

namespace Masala;

use Models\TranslatorModel,
    Nette\Forms\Container,
    Nette\Http\IRequest,
    Nette\Application\UI\Form,
    Nette\Application\UI\Presenter;

/** @author Lubomir Andrisek */
final class NetteFilterForm extends Form implements INetteFilterFormFactory {

    /** @var IBuilder */
    private $grid;

    /** @var Request */
    private $request;

    /** @var TranslatorModel */
    private $translatorModel;

    public function __construct(IRequest $request, TranslatorModel $translatorModel) {
        parent::__construct(null, null);
        $this->request = $request;
        $this->translatorModel = $translatorModel;
    }

    /** @return INetteFilterFormFactory */
    public function create() {
        return $this;
    }

    /** @return INetteFilterFormFactory */
    public function setGrid(IBuilder $grid) {
        $this->grid = $grid;
        return $this;
    }

    /** @return array */
    private function getDefaults() {
        $defaults = $this->grid->getDefaults();
        if (null == $spice = json_decode(urldecode($this->request->getUrl()->getQueryParameter(strtolower($this->getParent()->getName()) . '-spice')))) {
            $spice = [];
        }
        foreach ($spice as $key => $grain) {
            $column = preg_replace('/\s(.*)/', '', $key);
            if (preg_match('/\s>/', $key) and isset($defaults[$column]) and is_array($defaults[$column]) and isset($defaults[$column]['>']) and $key == $column . ' >') {
                $defaults[$column]['>'] = $grain;
            } elseif (preg_match('/\s</', $key) and isset($defaults[$column]) and is_array($defaults[$column]) and isset($defaults[$column]['<']) and $key == $column . ' <') {
                $defaults[$column]['<'] = $grain;
            } elseif (isset($defaults[$column]) and ! is_array($defaults[$column])) {
                $defaults[$column] = $grain;
            }
        }
        return $defaults;
    }

    public function attached($presenter) {
        parent::attached($presenter);
        if ($presenter instanceof Presenter) {
            $this->setMethod('post');
            $this['filter'] = new Container;
            $defaults = $this->getDefaults();
            foreach ($this->grid->getColumns() as $name => $annotation) {
                /** filter */
                if (true == $this->grid->getAnnotation($name, ['unfilter', 'hidden'])) {
                    
                } elseif (true == $this->grid->getAnnotation($name, 'addDate')) {
                    $this['filter']->addDateTimePicker($name, ucfirst($this->translatorModel->translate($name)), 100)
                            ->setReadOnly(false);
                } elseif (true == $this->grid->getAnnotation($name, 'addCheckbox')) {
                    $this->addCheckbox($name);
                } elseif (true == $this->grid->getAnnotation($name, 'range') or is_array($this->grid->getRange($name))) {

                    $this['filter']->addRange($name, ucfirst($this->translatorModel->translate($name)), $defaults[$name]);
                } elseif (is_array($defaults[$name]) and ! empty($defaults[$name]) and true == $this->grid->getAnnotation($name, 'multi')) {
                    $defaults[$name] = [null => $this->translatorModel->translate('--unchosen--')] + $defaults[$name];
                    $this['filter']->addMultiSelect($name, ucfirst($this->translatorModel->translate($name)), $defaults[$name])
                            ->setAttribute('min-width', '10px;')
                            ->setAttribute('class', 'form-control');
                } elseif (is_array($defaults[$name]) and ! empty($defaults[$name])) {
                    $this['filter']->addSelect($name, ucfirst($this->translatorModel->translate($name)), $defaults[$name])
                            ->setAttribute('class', 'form-control')
                            ->setAttribute('style', 'height:100%')
                            ->setAttribute('onchange', 'handleFilter()')
                            ->setPrompt($this->translatorModel->translate('--unchosen--'));
                } else {
                    $this['filter']->addText($name, ucfirst($this->translatorModel->translate($name)))->setAttribute('class', 'form-control');
                }
                /** default values */
                if (true == $this->grid->getAnnotation($name, ['unfilter', 'hidden'])) {
                    
                } elseif (!empty($spice) and isset($spice->$name) and isset($defaults[$name]) and ! is_array($defaults[$name])) {
                    $this['filter'][$name]->setDefaultValue($spice->$name);
                } elseif (true == $this->grid->getAnnotation($name, 'fetch') and ! preg_match('/\(/', $annotation) and is_array($default = $defaults[$name])) {
                    $default = array_shift($default);
                    $default = is_object($default) ? $default->__toString() : $default;
                    $this['filter'][$name]->setDefaultValue($default);
                } elseif (is_array($this->grid->getFilter($this->grid->getColumn($name))) or true == $this->grid->getAnnotation($name, 'multi')) {
                    
                } elseif (is_array($defaults[$name]) and isset($defaults[$name][$this->grid->getFilter($this->grid->getColumn($name))])) {
                    $this['filter'][$name]->setDefaultValue($this->grid->getFilter($this->grid->getColumn($name)));
                } elseif (is_array($defaults[$name]) and false == $this->grid->getAnnotation($name, 'range')) {
                    $this['filter'][$name]->setPrompt('-- ' . $this->translatorModel->translate('choose') . ' ' . $this->translatorModel->translate($name, 1) . ' --');
                } elseif (isset($defaults[$name]) and false == $this->grid->getAnnotation($name, 'range')) {
                    $this['filter'][$name]->setDefaultValue($defaults[$name]);
                }
            }
        }
    }

    protected function createComponentRange() {
        return $this->rangeFactory->create();
    }

}

interface INetteFilterFormFactory {

    /** @return NetteFilterForm */
    function create();
}