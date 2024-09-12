from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
import cloudinary.uploader
from theses.models import *


class NguoiDungSerializer(serializers.ModelSerializer):
    # group_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()

    class Meta:
        model = NguoiDung
        fields = ["pk","first_name", "last_name", "username", "password", "email", "class_name","avatar"]
        extra_kwargs = {"password": {"write_only": True}} # trường password chỉ để đăng ký, đừng đọc, trả về

    def create(self, validated_data):
        user = NguoiDung(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

    def get_group_name(self, obj):
        groups = obj.groups.all()
        if groups:
            return groups[0].name
        return ''

    def get_class_name(self, obj):
        group_name = self.get_group_name(obj)
        if group_name:
            return group_name
        elif isinstance(obj, SinhVien):
            return 'SinhVien'
        elif isinstance(obj, GiangVien):
            return 'GiangVien'
        elif isinstance(obj, GiaoVu):
            return 'GiaoVu'
        else:
            return 'NguoiDung'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        class_name = self.get_class_name(instance)
        data['class_name'] = class_name
        return data


class NguoiDungDetailSerializer(NguoiDungSerializer):
    avatar = serializers.SerializerMethodField(source='avatar')
    def get_avatar(self,obj):
        req = self.context.get('request')
        if req:
            return req.build_absolute_uri(f'/static/{obj.avatar.name}')
        return f'/static/{obj.avatar.name}'

    class Meta(NguoiDungSerializer.Meta):
        model = NguoiDung
        fields = NguoiDungSerializer.Meta.fields



class LopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lop
        fields = ["ten_lop"]


class SinhVienSerializer(NguoiDungSerializer):
    class Meta(NguoiDungSerializer.Meta):
        model = SinhVien
        fields = NguoiDungSerializer.Meta.fields + ["mssv", "nam_nhap_hoc", "lop"]

    def create(self, validated_data):
        user = SinhVien(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user


class SinhVienDetailSerializer(NguoiDungDetailSerializer):
    lop = LopSerializer()
    class Meta(NguoiDungDetailSerializer.Meta):
        model = SinhVien
        fields = NguoiDungDetailSerializer.Meta.fields+["mssv", "nam_nhap_hoc", "lop"]



class GiangVienDetailSerializer(NguoiDungDetailSerializer):
    class Meta(NguoiDungDetailSerializer.Meta):
        model = GiangVien
        fields = NguoiDungDetailSerializer.Meta.fields+["bang_cap", "kinh_nghiem"]


class GiaoVuDetailSerializer(NguoiDungDetailSerializer):
    class Meta(NguoiDungDetailSerializer.Meta):
        model = GiaoVu
        fields = NguoiDungDetailSerializer.Meta.fields+["trinh_do"]


class GiangVienSerializer(NguoiDungSerializer):
    class Meta(NguoiDungSerializer.Meta):
        model = GiangVien
        fields = NguoiDungSerializer.Meta.fields + ["bang_cap", "kinh_nghiem"]

    def create(self, validated_data):
        user = GiangVien(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user


class GiaoVuSerializer(NguoiDungSerializer):
    class Meta(NguoiDungSerializer.Meta):
        model = GiaoVu
        fields = NguoiDungSerializer.Meta.fields + ["trinh_do"]

    def create(self, validated_data):
        user = GiaoVu(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user


class HDBVKLSerializer(ModelSerializer):
    gv_phan_bien = serializers.SerializerMethodField()
    chu_tich = serializers.SerializerMethodField()
    thu_ky = serializers.SerializerMethodField()
    thanh_vien = serializers.SerializerMethodField()

    class Meta:
        model = HoiDongBVKL
        fields = "__all__"

    def get_gv_phan_bien(self, obj):
        return obj.gv_phan_bien.first_name + ' ' + obj.gv_phan_bien.last_name

    def get_chu_tich(self, obj):
        return obj.chu_tich.first_name + ' ' + obj.chu_tich.last_name

    def get_thu_ky(self, obj):
        return obj.thu_ky.first_name + ' ' + obj.thu_ky.last_name

    def get_thanh_vien(self, obj):
        return [f"{gv.first_name} {gv.last_name}" for gv in obj.thanh_vien.all()]



class NganhHocSerializer(ModelSerializer):
    class Meta:
        model = NganhHoc
        fields = ['id', 'ten_nganh', 'created_date']


class GVHuongDanSerializer(ModelSerializer):
    gv_huong_dan = GiangVienSerializer(many=True)

    class Meta:
        model = KLTNGVHuongDan
        fields = ["gv_huong_dan"]



class KLTNSerializer(ModelSerializer):
    mssv = SinhVienSerializer(many=True)
    # created_date = serializers.DateTimeField(format='%d %b %Y') # this one is correct, but I still want to use RN moment

    class Meta:
        model = KhoaLuanTotNghiep
        fields = [
            'id',
            'ten_khoa_luan',
            'ty_le_dao_van',
            'created_date',
            'diem_tong',
            'trang_thai',
            'mssv',
            'hdbvkl',
        ]

class KLTNGVHuongDanSerializer(ModelSerializer):
    kltn = KLTNSerializer()
    gv_huong_dan = GiangVienSerializer(many=True)
    class Meta:
        model = KLTNGVHuongDan
        fields = ["kltn","gv_huong_dan"]


class KLTNDetailsSerializer(KLTNSerializer):
    hdbvkl = HDBVKLSerializer()
    gv_huong_dan = serializers.SerializerMethodField() # what???
    tieu_chi = serializers.SerializerMethodField()

    class Meta:
        model = KhoaLuanTotNghiep
        fields = KLTNSerializer.Meta.fields + ['gv_huong_dan','tieu_chi','hdbvkl'] # dupe key nest
            # 'gv_phan_bien',

    def get_gv_huong_dan(self, obj):
        gv_huong_dan = KLTNGVHuongDan.objects.filter(kltn=obj)
        return GVHuongDanSerializer(gv_huong_dan, many=True).data

    def get_tieu_chi(self, obj):
        tieu_chi = obj.tieu_chi.all()
        return TieuChiSerializer(tieu_chi, many=True).data


class TieuChiSerializer(ModelSerializer):
    class Meta:
        model = TieuChi
        fields = ["id","tieu_chi", "ty_le"]


class DiemSerializer(ModelSerializer):
    tieu_chi = TieuChiSerializer()
    gv = NguoiDungSerializer()

    class Meta:
        model = Diem
        fields = "__all__"

class DiemGiangVien(ModelSerializer):
    tieu_chi = TieuChiSerializer()

    class Meta:
        model = Diem
        fields = ['id','tieu_chi', 'diem']

class KLTNGiangVienSerializer(serializers.ModelSerializer):
    class Meta:
        model = KhoaLuanTotNghiep
        fields = '__all__'


class EmailConfirmSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailConfirm
        fields = '__all__'
