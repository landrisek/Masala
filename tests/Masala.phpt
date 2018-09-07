<?php

namespace Test;

use Masala\IGridFactory;
use Masala\Masala,
    Masala\MockService,
    Nette\DI\Container,
    Nette\Reflection\Method,
    Tester\Assert,
    Tester\TestCase;

$container = require __DIR__ . '/../../bootstrap.php';

/** @author Lubomir Andrisek */
final class MasalaTest extends TestCase {

    /** @var Container */
    private $container;

    /** @var Masala */
    private $class;

    /** @var MockService */
    private $mockService;

    public function __construct(Container $container) {
        $this->container = $container;
    }

    protected function setUp() {
        $this->mockService = $this->container->getByType('Masala\MockService');
        $this->class = $this->container->getByType('Masala\Masala');
        $this->container->getByType('Nette\Localization\ITranslator')->setLocale('cs_CZ');
    }

    public function __destruct() {
        echo 'Tests of ' . get_class($this->class) . ' finished.' . "\n";
        stream_wrapper_restore('php');
    }

    public function testAttached() {
        Assert::true(file_exists($path = $this->container->parameters['wwwDir'] . '/app/Masala/'), 'Masala folder does not exist in default folder. Please modify test.');
        $columns = scandir($path);
        foreach ($columns as $column) {
            if (0 < substr_count($column, 'column') and 'column.latte' != $column) {
                Assert::same(0, preg_match('/{\*|\*}/', file_get_contents($path . $column)), 'There is comment mark {* or *} in latte ' . $column . ' Masala.');
                Assert::true(1 < count($presenter = explode('.', $column)), 'In column name is not enough arguments to assign presenter.');
                Assert::true(class_exists($class = 'App\\' . ucfirst($presenter[0]) . 'Module\\' . ucfirst($presenter[1]) . 'Presenter'), $class . ' does not exist.');
                if (isset($presenter[2]) and 'column' != $presenter[2]) {
                    Assert::false(empty($method = 'action' . ucfirst($presenter[2])), 'Assigned method is empty string.');
                    Assert::true(is_object($object = new $class()), 'Instatiation of ' . $class . ' failed.');
                    Assert::true(method_exists($object, $method), $class . ' must have method ' . $method . '.');
                    Assert::true(is_object($reflection = new Method(get_class($object), $method)), 'Reflection failed.');
                    Assert::notSame(0, count($parameters = $reflection->getParameters()), 'Method ' . $method . ' of class ' . $class . ' should have one parameter at least. Do you wish to modify test?');
                }
            }
        }
        Assert::true(is_object($extension = $this->container->getByType('Masala\MasalaExtension')));
        Assert::false(empty($config = $extension->getConfiguration($this->container->parameters)));
        Assert::false(empty($settings = (array) json_decode($this->mockService->getUser()->getIdentity()->getData()[$config['masala']['settings']])), 'Test user does not have settings.');
        Assert::false(empty($setting = (array) reset($settings)), 'User setting is not set');
        $_POST['test'] = true;
        Assert::false(empty($_POST), 'Post data cannot be empty so IPresenter:sendResponse would be not mocked.');
        $presenters = $this->mockService->getPresenters('IMasalaFactory');
        $_POST = [];
        foreach ($presenters as $class => $presenter) {
            if(isset($this->container->parameters['mockService']['presenters'][$class])) {
                $testParameters = $this->container->parameters['mockService']['presenters'][$class];
            } else if(isset($this->container->parameters['mockService']['testParameters'])) {
                $testParameters = $this->container->parameters['mockService']['testParameters'];
            } else {
                $testParameters = [];
            }
            echo 'testing ' . $presenter . "\n";
            Assert::true(is_array($parameters = $presenter->request->getParameters('action')), 'Parameters have not been set in ' . $class . '.');
            Assert::notSame(6, strlen($method = 'action' . ucfirst(array_shift($parameters))), 'Action method of ' . $class . ' is not set.');
            Assert::true(is_object($reflection = new Method($class, $method)));
            $arguments = [];
            foreach ($reflection->getParameters() as $parameter) {
                Assert::true(isset($testParameters[$parameter->getName()]), 'There is no test parameters for ' . $parameter->getName() . ' in ' . $class . '.');
                $arguments[$parameter->getName()] = $testParameters[$parameter->getName()];
            }
            Assert::true(method_exists($class, $method), 'According to latte file should exist method ' . $method . ' in ' . $class . '.');
            Assert::true(is_string($source = $presenter->grid->getTable()), 'Source set in method ' . $method . ' of ' . $class . ' is not set.');
            Assert::false(empty($source), 'Table in ' . $class . ':' . $method . ' is empty.');
            Assert::true(is_object($presenter->grid->where('id IS NOT NULL')), 'Grid setter method does not return class itself.');
            Assert::true(is_object($this->class->setGrid($presenter->grid)), 'IMasalaFactory::setGrid failed.');
            Assert::true(is_object($this->class->setRow($presenter->grid->copy())), 'IMasalaFactory::setGrid failed.');
            $presenter->addComponent($this->class, 'IMasalaFactory');
            Assert::true(is_object($grid = $presenter->grid), 'Grid IBuilder is not set.');
            Assert::same($source, $presenter->grid->getTable(), 'Source ' . $source . ' for Masala IBuilder was not set.');
            Assert::false(isset($presenter->grid->select), 'Select in IBuilder should be private.');
            Assert::false(isset($presenter->grid->join), 'Join in IBuilder should be private.');
            Assert::false(isset($presenter->grid->leftJoin), 'Left join in IBuilder should be private.');
            Assert::false(isset($presenter->grid->innerJoin), 'Inner join in IBuilder should be private.');
            Assert::true(is_array($filters = (null != $presenter->grid->getFilters()) ? $presenter->grid->getFilters() : []), 'Filters in Masala IBuilder are not set.');
            Assert::same($presenter->grid, $presenter->grid->table($source), 'Set table of VO does not return class itself.');
            Assert::true(is_array($columns = $presenter->grid->getDrivers($source)), 'Table columns are not defined.');
            Assert::true(is_object($grid = $this->mockService->getPrivateProperty($this->class, 1)), 'Masala builder is not set.');
            Assert::true(is_array($renderColumns = $presenter->grid->getColumns()), 'No columns was rendered.');
            foreach($renderColumns as $column => $annotation) { break; }
            Assert::true(empty($_POST), 'Post data have to be empty so IGridFactory:handleSetting would not mismatched settings.');
            $_POST[$column] = 'true';
            Assert::same(sizeof($_POST), 1, 'More test columns than expected.');
            Assert::false(empty($_POST), 'No column to annotate is set.');
            Assert::true(is_object($gridFactory = $this->mockService->getPrivateProperty($this->class, 2)), 'IGridFactory is not set.');
            Assert::true($gridFactory instanceof IGridFactory, 'GridFactory has wrong instation.');
            Assert::same($gridFactory, $gridFactory->setGrid($grid), 'GridFactory::setGrid does not return class itself.');
            Assert::same($presenter, $presenter->addComponent($gridFactory, 'gridFactory'), 'IPresenter::addComponent does not return class itself.');
            Assert::true(is_object($filterForm = $this->mockService->getPrivateProperty($gridFactory, 3)), 'FilterForm is not set.');
            Assert::false(empty($filterForm->getData()), 'No data for filterForm.');
            Assert::true(isset($_POST[$column]), 'Test $_POST data were unexpected overwrited.');
            $this->mockService->setPost($_POST);
            Assert::same(null, $gridFactory->handleSetting(), 'Grid::handleSetting failed.');
            $_POST[$column] = 'false';
            Assert::same(null, $gridFactory->handleSetting(), 'Grid::handleSetting failed.');
            $notShow = [];
            $overload = $presenter->grid->getColumns();
            foreach ($columns as $column) {
                if (isset($overload[$column['name']]) && 0 == substr_count($column['vendor']['Comment'], '@hidden')) {
                } else if (0 < substr_count($column['vendor']['Comment'], '@hidden')) {
                    $notShow[$column['name']] = $column['name'];
                }
            }
            Assert::false(empty($this->class->getGrid()->getColumns()),'Columns are not set.');
            foreach ($renderColumns as $key => $renderColumn) {
                if (isset($notShow[$key])) {
                    Assert::true(is_object($reflector = new \ReflectionClass($class)), 'Reflection is not set.');
                    Assert::false(empty($file = $reflector->getFileName()), 'File of ' . $class . ' is not set.');
                    Assert::false(is_object($handle = fopen($file, 'r+')), 'Open tested controller failed.');
                    echo $file . "\n";
                    $read = false;
                    while (!feof($handle)) {
                        $line = fgets($handle);
                        if (preg_match('/' . $method . '/', $line)) {
                            $read = true;
                        } elseif (true == $read and preg_match('/\}/', $line)) {
                            break;
                        } elseif (true == $read and preg_match('/' . $key . '/', $line)) {
                            echo $line;
                            Assert::same(0, preg_match('/@hidden/', $line), 'Discovered @hidden annotation in rendered ' . $source . '.' . $key . ' in ' . $class . ':' . $method);
                        }
                    }
                }
            }
            $this->setUp();
        }
    }

    public function testHandleExport() {
        Assert::same(null, $this->mockService->setPost(['Offset'=>1]), 'MockService:setPost succeed but it does return something. Do you wish to modify test?');
        Assert::true(is_object($this->class->setGrid($this->container->getByType('Masala\IBuilder')->export(true))));
    }

    public function testHandleRun() {
        $row = $this->container->getByType('Masala\IBuilder');
        Assert::false(empty($tables = $this->container->parameters['tables']), 'Test source was not set.');
        Assert::false(empty($excluded = $this->container->parameters['mockService']['excluded']), 'No tables to excluded. Do you wish to modify test?');
        foreach($excluded as $exclude) {
            unset($tables[$exclude]);
        }
        Assert::false(empty($key = array_rand($tables)), 'Test source was not set.');
        Assert::false(empty($source = $this->container->parameters['tables'][$key]), 'Test source was not set.');
        Assert::false(empty($columns = $row->table($source)->getDrivers($source)), 'Columns of tables ' . $source . ' was not set.');
        Assert::false(empty($source = $this->container->parameters['tables']['help']), 'Test source for table help was not set.');
        Assert::false(empty($columns = $row->table($source)->getDrivers($source)), 'Columns of tables ' . $source . ' was not set.');
        Assert::true(isset($columns['json']), 'Json column was not set');
        Assert::same('json', $columns['json']['name'], 'Json column was not set');
        Assert::false(empty($comment = $columns['json']['vendor']['Comment']), 'Json column comment should be not empty');
        Assert::same(1, substr_count($comment, '@hidden'), $source . '.json should have disabled comment via annotation @hidden.');
    }

    public function testRender() {
        $latte = $this->container->parameters['wwwDir'] . '/app/Masala/templates/grid.latte';
        Assert::true(is_file($latte), 'Latte file ' . $latte . ' for grid is not set.');
        Assert::false(empty($grid = file_get_contents($latte)), 'Latte file is empty.');
        Assert::true(0 < substr_count($grid, '<script src="{$js}"></script>'), 'It seems that react component is not included.');
    }

}

id(new MasalaTest($container))->run();
