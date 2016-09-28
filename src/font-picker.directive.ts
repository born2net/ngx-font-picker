import { Observable } from 'rxjs/Rx';

import { Directive, OnInit, Input, Output, EventEmitter, ElementRef, ChangeDetectorRef, ViewContainerRef, ComponentFactoryResolver, Compiler, ReflectiveInjector } from '@angular/core';
import { FontPickerService } from './font-picker.service';
import { FontPickerComponent } from './font-picker.component';

import { Font } from './interfaces';

import {DynamicFpModule} from "./dynamic-fp.module";

@Directive({
  selector: '[fontPicker]',
  host: {
    '(click)': 'onClick()'
  }
})
export class FontPickerDirective implements OnInit {
  private dialog: any;

  private created: boolean = false;
  private closed: boolean = false;

  @Input('fontPicker') fontPicker: Font;

  @Input('fpWidth') fpWidth: string = '280px';
  @Input('fpHeight') fpHeight: string = '320px';

  @Input('fpFallbackFont') fpFallbackFont: Font = new Font({
    family: 'Roboto',
    styles: ['regular'],
    style: 'regular',
    size: 14
  });

  @Input('fpPresetLabel') fpPresetLabel: string;
  @Input('fpPresetFonts') fpPresetFonts: Array<string>;

  @Input('fpPosition') fpPosition: string = 'right';
  @Input('fpPositionOffset') fpPositionOffset: string = '0%';
  @Input('fpPositionRelativeToArrow') fpPositionRelativeToArrow: boolean = false;

  @Input('fpCancelButton') fpCancelButton: boolean = false;
  @Input('fpCancelButtonText') fpCancelButtonText: string = 'Cancel';
  @Input('fpCancelButtonClass') fpCancelButtonClass: string = 'fp-cancel-button-class';

  @Input('fpUploadButton') fpUploadButton: boolean = false;
  @Input('fpUploadButtonText') fpUploadButtonText: string = 'Upload';
  @Input('fpUploadButtonClass') fpUploadButtonClass: string = 'fp-upload-button-class';

  @Output('fontPickerChange') fontPickerChange = new EventEmitter<Font>();

  constructor( private resolver: ComponentFactoryResolver, private el: ElementRef, private vc: ViewContainerRef,
    private cd : ChangeDetectorRef, private service: FontPickerService, private compiler: Compiler ) { }

  ngOnInit() {
		var fontPicker = this.fontPicker;

		if (!this.fontPicker) {
			this.fontPicker = this.fpFallbackFont;
		}

    this.fontPickerChange.emit(this.fontPicker);

		if (fontPicker != this.fontPicker) {
      this.cd.detectChanges();
    }
  }

  onClick() {
    if(this.closed){
      this.dialog.openFontPicker();
      this.closed = false;
    } else if (!this.created) {
        this.created = true;
        this.compiler.compileModuleAndAllComponentsAsync(DynamicFpModule)
            .then(factory => {
                const compFactory = factory.componentFactories.find(x => x.componentType === FontPickerComponent);
                const injector = ReflectiveInjector.fromResolvedProviders([], this.vc.parentInjector);
                let component = this.vc.createComponent(compFactory, 0, injector, []);
                  component.instance.setDialog(this, this.el, this.fontPicker, this.fpPosition,
                    this.fpPositionOffset, this.fpPositionRelativeToArrow, this.fpPresetLabel,
                    this.fpPresetFonts, this.fpUploadButton, this.fpUploadButtonClass,
                    this.fpUploadButtonText, this.fpCancelButton, this.fpCancelButtonClass,
                    this.fpCancelButtonText, this.fpHeight, this.fpWidth);
                this.dialog = component.instance;
            });
    } else if (this.dialog) {
        this.dialog.closeFontPicker();
        this.closed = true;
    }
  }
}
