from django import forms
from django.utils import timezone


class DateRangeForm(forms.Form):
    start = forms.DateTimeField(label="From", input_formats=['%d/%m/%Y', '%d/%m/%Y %H:%M'], initial=timezone.now())
    end = forms.DateTimeField(label="to", input_formats=['%d/%m/%Y', '%d/%m/%Y %H:%M'])