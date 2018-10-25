@extends('layouts.app')

@section('content-padding', '')

@section('content')
<div class="row">
    <div class="col-2">
        <div class="container map-sidebar">
            <h3>Players</h3>

            <ul id="playerList"></ul>
        </div>
    </div>

    <div class="col-10 p-0">
        <div id="map"></div>
    </div>
</div>
@endsection

@section('scripts')
    <script defer src="{{ asset('js/map.js') }}"></script>
@endsection
