-module(light_node_app).
-behaviour(application).
-export([start/2, stop/1]).
start(_StartType, _StartArgs) ->
    light_node_sup:start_link().
stop(_State) ->
    ok.
