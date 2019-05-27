---
layout: readme
title: Readme
tags:
    - foo
    - bar
    - post
date: 2019-05-25
# permalink: false # still available in collection, but no separate page for itself!

# Custom data goes here
foo: bar
bar: baz
---

# Readme bois

{{ foo }}
{{ bar }}

<ul>
{% for monster in monsters %}
<li><a href="/monster/{{ monster }}">{{ monster }}<a></li>
{% endfor %}
</ul>

<ul>
{% for weapon in weapons %}
<li><a href="/weapon/{{ weapon }}">{{ weapon }}<a></li>
{% endfor %}
</ul>

<ul>
{% for location in locations %}
<li><a href="/location/{{ location }}">{{ location }}<a></li>
{% endfor %}
</ul>
