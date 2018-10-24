@extends('layouts.app')

@section('content-padding', '')

@section('content')
    <div id="map">
        
    </div>
@endsection

@section('scripts')
    <script defer src="{{ asset('js/map.js') }}"></script>
@endsection
