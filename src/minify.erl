-module(minify).
-export([doit/1, doit/0]).

doit() ->
    Default = "js/wallet.html",
    doit(Default).
doit(FL) ->
    {ok, B} = file:read_file(FL),
    OnePage = insert_js(B, <<>>),
    file:write_file("one_page.html", OnePage).
insert_js(<<>>, X) -> X;
insert_js(<<"<script", R/binary>>, Out) ->
    io:fwrite("insert page of js\n"),
    Src = get_src(R),
    FN = <<"js/", Src/binary>>,
    io:fwrite("file name is "),
    io:fwrite(FN),
    io:fwrite("\n"),
    {ok, JS} = file:read_file(FN),
    %Rest = remove_till(<<"</script>">>, R),
    _Rest = remove_till_script(R),
    Out2 = <<Out/binary,
	    "<script>\n", 
	    JS/binary>>,
    insert_js(R, Out2);
insert_js(<<A, R/binary>>, Out) ->
    insert_js(R, <<Out/binary, A>>).
get_src(<<"src=\"", R/binary>>) ->
    io:fwrite("searching for the page's name\n"),
    read_till_js(R, <<>>);
get_src(<<_, R/binary>>) -> get_src(R).
read_till_js(<<".js", _/binary>>, Out) ->
    io:fwrite("finding page name\n"),
    <<Out/binary, ".js">>;
read_till_js(<<A, T/binary>>, Out) ->
    io:fwrite("searching 2\n"),
    read_till_js(T, <<Out/binary, A>>).
remove_till_script(<<"</script>", R/binary>>) -> 
    <<"</script>", R/binary>>;
remove_till_script(<<A, R/binary>>) ->
    io:fwrite("removing text\n"),
    remove_till_script(R).
