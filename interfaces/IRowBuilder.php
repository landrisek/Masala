<?php

namespace Masala;

interface IRowBuilder {

    /** @return int */
    function add(array $data);

    /** @return int */
    function delete();

    /** @return array */
    function getColumns();

    /** @return array */
    function getConfig($key);
    
    /** @return IRowBuilder */
    function table($table);
    
    /** @return int */
    function update(array $data);

    /** @return IRowBuilder */
    function where($column, $value, $condition = null);

}
