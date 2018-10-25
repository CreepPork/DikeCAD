<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Marker extends Model
{
    protected $fillable = ['name', 'position_X', 'position_Y', 'image'];
}
